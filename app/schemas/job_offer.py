# SPDX-License-Identifier: AGPL-3.0-or-later
# app/schemas/job_offer.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class JobOfferBase(BaseModel):
    title: str
    company: str
    location: str | None = None
    url: str
    platform: str
    rating: str | None = None
    summary:str | None = None
    description: str | None = None
    easy_apply: bool | None = None
    active_hiring: bool | None = None
    posted_at: datetime | None = None
    source_email_id: str | None = None

class JobOfferCreate(JobOfferBase):
    pass

class JobOfferUpdate(BaseModel):
    title: str | None = None
    company: str | None = None
    rating: str | None = None
    location: str | None = None
    summary: str | None = None
    description: str | None = None
    url: str | None = None
    platform: str | None = None
    easy_apply: bool | None = None
    active_hiring: bool | None = None
    posted_at: datetime | None = None
    source_email_id: str | None = None

class JobOfferRead(JobOfferBase):
    id: int
    date_scraped: datetime

    model_config = ConfigDict(from_attributes=True)