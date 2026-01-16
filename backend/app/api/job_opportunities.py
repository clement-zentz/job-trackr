# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/api/job_opportunities.py

from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.domain.errors import JobOpportunityNotFound
from app.schemas.job_opportunity import (
    JobOpportunityCreate,
    JobOpportunityRead,
    JobOpportunityUpdate,
)
from app.services.job_opportunity import (
    JobOpportunityService,
    get_job_opportunity_service,
)

router = APIRouter(prefix="/job-opportunities", tags=["Job Opportunities"])


# --- Write ---
@router.post(
    "",
    response_model=JobOpportunityRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_job_opportunity(
    data: JobOpportunityCreate,
    service: JobOpportunityService = Depends(get_job_opportunity_service),
):
    return await service.create(data)


@router.patch(
    "/{job_opportunity_id}",
    response_model=JobOpportunityRead,
    status_code=status.HTTP_200_OK,
)
async def update_job_opportunity(
    job_opportunity_id: UUID,
    data: JobOpportunityUpdate,
    service: JobOpportunityService = Depends(get_job_opportunity_service),
):
    try:
        return await service.update(job_opportunity_id, data)
    except JobOpportunityNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Opportunity not found",
        ) from None


@router.patch(
    "/{job_opportunity_id}/deactivate",
    response_model=JobOpportunityRead,
    status_code=status.HTTP_200_OK,
)
async def deactivate(
    job_opportunity_id: UUID,
    service: JobOpportunityService = Depends(get_job_opportunity_service),
):
    try:
        return await service.deactivate(job_opportunity_id)
    except JobOpportunityNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Opportunity not found",
        ) from None


# --- Read ---
@router.get(
    "/{job_opportunity_id}",
    response_model=JobOpportunityRead,
    status_code=status.HTTP_200_OK,
)
async def get_job_opportunity(
    job_opportunity_id: UUID,
    service: JobOpportunityService = Depends(get_job_opportunity_service),
):
    try:
        return await service.get_by_id(job_opportunity_id)
    except JobOpportunityNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Opportunity not found",
        ) from None


@router.get(
    "",
    response_model=Sequence[JobOpportunityRead],
    status_code=status.HTTP_200_OK,
)
async def list_job_opportunities(
    offset: int = 0,
    limit: int = 50,
    service: JobOpportunityService = Depends(get_job_opportunity_service),
):
    return await service.list_page(
        limit=limit,
        offset=offset,
    )
