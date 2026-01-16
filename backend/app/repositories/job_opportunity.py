# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/repositories/job_opportunity.py

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_opportunity import JobOpportunity


class JobOpportunityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # --- Write ---
    async def add(self, job_opportunity: JobOpportunity) -> None:
        self.session.add(job_opportunity)

    # --- Primary reads ---
    async def get_by_id(
        self,
        job_opportunity_id: UUID,
    ) -> JobOpportunity | None:
        return await self.session.get(
            JobOpportunity,
            job_opportunity_id,
        )

    # --- Secondary reads ---
    async def list_page(
        self,
        *,
        offset: int,
        limit: int,
    ) -> Sequence[JobOpportunity]:
        stmt = (
            select(JobOpportunity)
            .offset(offset)
            .limit(limit)
            .order_by(JobOpportunity.created_at.desc())
        )
        return (await self.session.scalars(stmt)).all()
