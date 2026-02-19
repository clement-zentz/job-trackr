# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/email_ingestion.py

import logging

from job_extraction.schemas.extracted_jobs import JobPostingResponse

from .extraction.email.email_alert_fetcher import EmailAlertFetcher
from .extraction.email.job_extraction_service import JobExtractionService

logger = logging.getLogger(__name__)


class JobIngestionService:
    """Service to ingest job offers from various sources into the database"""

    async def ingest_from_email(
        self,
        email_address: str,
        password: str,
        folder: str = "INBOX",
        days_back: int = 3,
    ) -> list[JobPostingResponse]:
        """Fetch job alerts from email and extract normalized job postings."""
        email_fetcher = EmailAlertFetcher(email_address, password, folder)
        emails = email_fetcher.fetch_recent(days_back)

        extractor = JobExtractionService()
        extracted_jobs = extractor.extract_jobs(emails)

        created_jobs: list[JobPostingResponse] = []

        for raw_job in extracted_jobs:
            uid = raw_job.get("source", {}).get("uid")

            job_posting = JobPostingResponse(
                title=raw_job.get("title", ""),
                company=raw_job.get("company", ""),
                location=raw_job.get("location"),
                raw_url=raw_job.get("raw_url", ""),
                canonical_url=raw_job.get("canonical_url"),
                job_key=raw_job.get("job_key"),
                platform=raw_job.get("source", {}).get("platform", ""),
                ingestion_source=raw_job.get("ingestion_source", "email"),
                rating=raw_job.get("rating"),
                salary=raw_job.get("salary"),
                summary=raw_job.get("summary"),
                description=raw_job.get("description"),
                easy_apply=raw_job.get("easy_apply"),
                active_hiring=raw_job.get("active_hiring"),
                posted_at=raw_job.get("posted_at"),
                source_event_id=str(uid) if uid is not None else None,
            )
            created_jobs.append(job_posting)

        return created_jobs
