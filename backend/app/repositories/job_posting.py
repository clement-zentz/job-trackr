# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/repositories/job_posting.py

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.job_posting import JobPosting


class JobPostingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, job_posting: JobPosting) -> None:
        self.session.add(job_posting)

    async def get_by_id(
        self,
        job_posting_id: UUID,
    ) -> JobPosting | None:
        stmt = select(JobPosting).where(JobPosting.id == job_posting_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_raw_url(
        self,
        raw_url: str,
    ) -> JobPosting | None:
        stmt = select(JobPosting).where(JobPosting.raw_url == raw_url)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_job_key(
        self,
        *,
        platform: str,
        job_key: str,
    ) -> JobPosting | None:
        stmt = select(JobPosting).where(
            JobPosting.platform == platform,
            JobPosting.job_key == job_key,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        platform: str | None = None,
        company: str | None = None,
        has_job_opportunity: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[JobPosting]:
        """
        List job_postings with optional filters.
        Intended for dashboards and browsing.
        """
        stmt = select(JobPosting)

        if platform is not None:
            stmt = stmt.where(JobPosting.platform == platform)

        if company is not None:
            stmt = stmt.where(JobPosting.company == company)

        if has_job_opportunity is not None:
            if has_job_opportunity:
                stmt = stmt.where(JobPosting.job_opportunity.any())
            else:
                stmt = stmt.where(~JobPosting.job_opportunity.any())

        stmt = stmt.order_by(JobPosting.date_scraped.desc()).limit(limit).offset(offset)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_applications(
        self,
        job_posting_id: UUID,
    ) -> JobPosting | None:
        """
        Load a JobPosting with its applications eagerly.
        Useful for detail views.
        """
        stmt = (
            select(JobPosting)
            .where(JobPosting.id == job_posting_id)
            .options(selectinload(JobPosting.job_opportunity))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
