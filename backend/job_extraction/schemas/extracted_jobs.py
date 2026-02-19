# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/schemas/extracted_jobs.py

from datetime import datetime

from pydantic import BaseModel


class JobPostingResponse(BaseModel):
    title: str
    company: str
    location: str | None = None
    raw_url: str
    canonical_url: str | None = None
    job_key: str | None = None
    platform: str
    ingestion_source: str
    rating: float | None = None
    salary: str | None = None
    summary: str | None = None
    description: str | None = None
    easy_apply: bool | None = None
    active_hiring: bool | None = None
    posted_at: datetime | None = None
    source_event_id: str | None = None


class IngestResponse(BaseModel):
    total: int
    jobs: list[JobPostingResponse]
