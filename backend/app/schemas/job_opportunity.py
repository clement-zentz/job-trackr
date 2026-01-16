# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/schemas/job_opportunity.py

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.job_opportunity import JobOpportunityPriority


class JobOpportunityBase(BaseModel):
    title: str
    company: str
    location: str | None = None
    priority: JobOpportunityPriority | None = None
    notes: str | None = None


class JobOpportunityCreate(JobOpportunityBase):
    pass


class JobOpportunityUpdate(BaseModel):
    title: str | None = None
    company: str | None = None
    location: str | None = None
    is_active: bool | None = None
    priority: JobOpportunityPriority | None = None
    notes: str | None = None


class JobOpportunityRead(JobOpportunityBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
