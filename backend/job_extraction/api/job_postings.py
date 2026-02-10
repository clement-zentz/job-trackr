# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/api/job_postings.py

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from job_extraction.config import Settings, get_settings
from job_extraction.email_ingestion import JobIngestionService
from job_extraction.schemas.extracted_jobs import IngestResponse
from job_extraction.services.django_client import DjangoIngestionClient

router = APIRouter(prefix="/job-postings", tags=["Job Postings"])


def get_settings_dep() -> Settings:
    settings = get_settings()

    if not settings.EMAIL_ADDRESS or not settings.EMAIL_PASSWORD:
        raise HTTPException(
            status_code=422,
            detail="Email credentials must be provided",
        )

    return settings


@router.post("", response_model=IngestResponse)
async def ingest_from_email(
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> IngestResponse:
    """Fetch and extract job postings from email alerts."""
    email = settings.EMAIL_ADDRESS
    pwd = settings.EMAIL_PASSWORD

    service = JobIngestionService()
    jobs = await service.ingest_from_email(email, pwd)

    django_client = DjangoIngestionClient(
        base_url=settings.JOB_TRACKR_URL,
        api_key=settings.INGESTION_API_KEY,
    )

    await django_client.ingest_job_postings(jobs)

    return IngestResponse(jobs=jobs, total=len(jobs))
