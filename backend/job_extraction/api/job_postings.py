# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/api/job_postings.py

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from job_extraction.config import Settings, get_settings
from job_extraction.email_ingestion import JobIngestionService
from job_extraction.schemas.extracted_jobs import IngestResponse
from job_extraction.services.django_client import DjangoIngestionClient

router = APIRouter(prefix="/job-postings", tags=["Job Postings"])


@router.post("", response_model=IngestResponse)
async def ingest_from_email(
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Fetch and extract job postings from email alerts."""
    email_address = settings.EMAIL_ADDRESS
    email_password = settings.EMAIL_PASSWORD

    if not email_address or not email_password:
        raise HTTPException(
            status_code=422,
            detail="EMAIL_ADDRESS and EMAIL_PASSWORD must be provided",
        )

    service = JobIngestionService()
    jobs = await service.ingest_from_email(email_address, email_password)

    ingestion_api_key = settings.INGESTION_API_KEY
    job_trackr_url = settings.JOB_TRACKR_URL

    django_client = DjangoIngestionClient(
        base_url=job_trackr_url,
        api_key=ingestion_api_key,
    )

    await django_client.ingest_job_postings(jobs)

    return IngestResponse(jobs=jobs, total=len(jobs))
