# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/ingestion/email_ingestion.py

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.extraction.email.email_alert_fetcher import EmailAlertFetcher
from app.extraction.email.job_extraction_service import JobExtractionService
from app.models.job_offer import JobOffer

logger = logging.getLogger(__name__)


class JobIngestionService:
    """Service to ingest job offers from various sources into the database"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def ingest_from_email(
        self,
        email_address: str,
        password: str,
        folder: str = "INBOX",
        days_back: int = 1,
    ) -> list[JobOffer]:
        """Fetch job alerts from email and save them to database."""
        email_fetcher = EmailAlertFetcher(email_address, password, folder)
        emails = email_fetcher.fetch_recent(days_back)

        job_extractor = JobExtractionService()
        raw_jobs = job_extractor.extract_jobs(emails)

        new_jobs: list[JobOffer] = []

        for job_data in raw_jobs:
            # check if job already exists by source_uid or unique URL
            existing = await self._find_existing_job(raw_url=job_data.get("raw_url"))

            if existing:
                continue

            job_offer = JobOffer(
                title=job_data.get("title", ""),
                company=job_data.get("company", ""),
                rating=job_data.get("rating", None),
                salary=job_data.get("salary", None),
                location=job_data.get("location", ""),
                active_hiring=job_data.get("active_hiring", None),
                easy_apply=job_data.get("easy_apply", None),
                posted_at=job_data.get("posted_at", None),
                raw_url=job_data.get("raw_url", ""),
                job_key=job_data.get("job_key", None),
                canonical_url=job_data.get("canonical_url", None),
                platform=job_data.get("platform", ""),
                source_email_id=job_data.get("source_uid"),
            )

            self.session.add(job_offer)
            new_jobs.append(job_offer)

        await self.session.commit()

        return new_jobs

    async def _find_existing_job(self, raw_url: str | None = None) -> JobOffer | None:
        """Check if a job already exists in the database with job raw_url."""
        if raw_url:
            statement = select(JobOffer).where(JobOffer.raw_url == raw_url)
            result = await self.session.execute(statement)
            return result.scalars().first()
        return None
