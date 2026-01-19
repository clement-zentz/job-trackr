# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/api/job_applications.py

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.domain.errors import JobOpportunityNotFound
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationRead,
    JobApplicationReadWithOpportunity,
    JobApplicationUpdate,
)
from app.services.job_application import (
    JobApplicationService,
    get_job_application_service,
)

router = APIRouter(prefix="/job-applications", tags=["Job Applications"])


@router.post("", response_model=JobApplicationRead, status_code=201)
async def create_job_application(
    data: JobApplicationCreate,
    service: JobApplicationService = Depends(get_job_application_service),
):
    try:
        return await service.create_application(data)
    except JobOpportunityNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Opportunity not found",
        ) from None


@router.get("", response_model=list[JobApplicationReadWithOpportunity])
async def list_job_applications(
    service: JobApplicationService = Depends(get_job_application_service),
):
    return await service.list_applications()


@router.patch(
    "/{job_application_id}",
    response_model=JobApplicationReadWithOpportunity,
    status_code=status.HTTP_200_OK,
)
async def update_job_application(
    job_application_id: UUID,
    data: JobApplicationUpdate,
    service: JobApplicationService = Depends(get_job_application_service),
):
    try:
        return await service.update_application_by_id(job_application_id, data)
    except ValueError:
        raise HTTPException(status_code=404, detail="Application not found") from None
