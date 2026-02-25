# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/services/ingestion_processor.py

from __future__ import annotations

from dataclasses import dataclass

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.ingestion.models import IngestedJobPosting, IngestionStatus
from apps.jobs.models import JobOpportunity, JobPosting
from apps.jobs.services.opportunity_identity import compute_opportunity_key


@dataclass(slots=True)
class ProcessingResult:
    job_posting_created: bool
    job_opportunity_created: bool


class IngestionProcessor:
    """
    Transforming an IngestedJobPosting into:

        - JobPosting
        - JobOpportunity

    This class is idempotent and concurrency-safe.
    """

    # ================================
    # Public API
    # ================================

    @transaction.atomic
    def process(self, ingested: IngestedJobPosting) -> ProcessingResult:
        """
        Process a single ingestion row.

        Expects row to already be locked (via select_for_update).
        """

        # Already processed? Idempotency protection
        if ingested.status == IngestionStatus.PROCESSED:
            return ProcessingResult(False, False)

        job_posting, job_posting_created = self._upsert_job_posting(ingested)

        job_opportunity, job_opportunity_created = self._get_or_create_job_opportunity(
            job_posting
        )

        if job_posting.job_opportunity_id != job_opportunity.id:
            job_posting.job_opportunity = job_opportunity
            job_posting.save(update_fields=["job_opportunity", "updated_at"])

        self._finalize_ingested(
            ingested,
            job_posting,
            job_opportunity,
        )

        return ProcessingResult(
            job_posting_created=job_posting_created,
            job_opportunity_created=job_opportunity_created,
        )

    # ================================
    # Internal helpers
    # ================================

    def _upsert_job_posting(
        self,
        ingested: IngestedJobPosting,
    ) -> tuple[JobPosting, bool]:
        # Fast path: lookup by fingerprint
        existing = JobPosting.objects.filter(
            posting_fingerprint=ingested.fingerprint
        ).first()

        if existing:
            return existing, False

        try:
            job_posting = JobPosting.objects.create(
                posting_fingerprint=ingested.fingerprint,
                title=ingested.title,
                company=ingested.company,
                raw_url=ingested.raw_url,
                platform=ingested.platform,
                location=ingested.location or "",
                summary=ingested.summary or "",
                salary=ingested.salary or "",
                description=ingested.description or "",
                canonical_url=ingested.canonical_url or "",
                job_key=ingested.job_key or "",
                rating=ingested.rating,
                easy_apply=bool(ingested.easy_apply),
                active_hiring=bool(ingested.active_hiring),
                posted_at=ingested.posted_at,
            )
            return job_posting, True

        except IntegrityError:
            # Concurrency protection: another worker created it
            return (
                JobPosting.objects.get(posting_fingerprint=ingested.fingerprint),
                False,
            )

    def _get_or_create_job_opportunity(
        self,
        job_posting: JobPosting,
    ) -> tuple[JobOpportunity, bool]:
        opportunity_key = compute_opportunity_key(
            title=job_posting.title,
            company=job_posting.company,
            location=job_posting.location,
        )

        try:
            job_opportunity, created = JobOpportunity.objects.get_or_create(
                opportunity_key=opportunity_key,
                defaults={
                    "title": job_posting.title,
                    "company": job_posting.company,
                    "location": job_posting.location,
                    "url": job_posting.canonical_url or job_posting.raw_url,
                },
            )
        except IntegrityError:
            job_opportunity = JobOpportunity.objects.get(
                opportunity_key=opportunity_key,
            )
            created = False

        return job_opportunity, created

    def _finalize_ingested(
        self,
        ingested: IngestedJobPosting,
        job_posting: JobPosting,
        job_opportunity: JobOpportunity,
    ) -> None:
        ingested.job_posting = job_posting
        ingested.job_opportunity = job_opportunity
        ingested.status = IngestionStatus.PROCESSED
        ingested.processed_at = timezone.now()
        ingested.error_message = ""

        ingested.save(
            update_fields=[
                "job_posting",
                "job_opportunity",
                "status",
                "processed_at",
                "error_message",
                "updated_at",
            ]
        )
