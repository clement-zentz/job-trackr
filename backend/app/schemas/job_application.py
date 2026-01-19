# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/schemas/job_application.py

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.job_application import JobApplicationStatus

from .job_opportunity import JobOpportunityRead


class JobApplicationBase(BaseModel):
    job_application_date: date
    notes: str | None = None


class JobApplicationCreate(JobApplicationBase):
    job_opportunity_id: UUID


class JobApplicationUpdate(BaseModel):
    status: JobApplicationStatus | None = None
    notes: str | None = None


class JobApplicationRead(JobApplicationBase):
    id: UUID
    status: JobApplicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobApplicationReadWithOpportunity(JobApplicationRead):
    job_opportunity: JobOpportunityRead
