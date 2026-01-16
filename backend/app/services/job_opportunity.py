# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/services/job_opportunity.py

from collections.abc import Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.domain.errors import JobOpportunityNotFound
from app.models.job_opportunity import JobOpportunity
from app.repositories.job_opportunity import JobOpportunityRepository
from app.schemas.job_opportunity import JobOpportunityCreate, JobOpportunityUpdate


class JobOpportunityService:
    def __init__(
        self,
        *,
        session: AsyncSession,
        repo: JobOpportunityRepository | None = None,
    ) -> None:
        self.session = session
        self.repo = repo or JobOpportunityRepository(session)

    # --- Creation ---
    async def create(
        self,
        data: JobOpportunityCreate,
    ) -> JobOpportunity:
        job_opportunity = JobOpportunity(**data.model_dump())

        await self.repo.add(job_opportunity)
        await self.session.commit()
        await self.session.refresh(job_opportunity)

        return job_opportunity

    # --- Mutations ---
    async def update(
        self,
        job_opportunity_id: UUID,
        data: JobOpportunityUpdate,
    ) -> JobOpportunity:
        job_opportunity = await self.repo.get_by_id(job_opportunity_id)
        if job_opportunity is None:
            raise JobOpportunityNotFound(job_opportunity_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(job_opportunity, field, value)

        await self.session.commit()
        return job_opportunity

    async def deactivate(
        self,
        job_opportunity_id: UUID,
    ) -> JobOpportunity:
        job_opportunity = await self.repo.get_by_id(job_opportunity_id)
        if job_opportunity is None:
            raise JobOpportunityNotFound(job_opportunity_id)

        if job_opportunity.is_active:
            job_opportunity.is_active = False
            await self.session.commit()

        return job_opportunity

    # --- Queries ---
    async def get_by_id(
        self,
        job_opportunity_id: UUID,
    ) -> JobOpportunity:
        job_opportunity = await self.repo.get_by_id(job_opportunity_id)
        if job_opportunity is None:
            raise JobOpportunityNotFound(job_opportunity_id)
        return job_opportunity

    async def list_page(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[JobOpportunity]:
        return await self.repo.list_page(limit=limit, offset=offset)


def get_job_opportunity_service(
    session: AsyncSession = Depends(get_session),
) -> JobOpportunityService:
    return JobOpportunityService(session=session)
