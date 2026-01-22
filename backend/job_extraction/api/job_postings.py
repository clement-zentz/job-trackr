# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/api/job_postings.py

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from job_extraction.config import Settings, get_settings
from job_extraction.email_ingestion import JobIngestionService
from job_extraction.schemas.extracted_jobs import IngestResponse

router = APIRouter(prefix="/job-postings", tags=["Job Postings"])


def get_settings_dep() -> Settings:
    try:
        return get_settings()
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail="Email credentials must be provided",
        ) from exc


@router.post("", response_model=IngestResponse)
async def ingest_from_email(
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> IngestResponse:
    """Fetch and extract job postings from email alerts."""
    email = settings.email_address
    pwd = settings.email_password

    service = JobIngestionService()
    jobs = await service.ingest_from_email(email, pwd)

    return IngestResponse(jobs=jobs, total=len(jobs))
