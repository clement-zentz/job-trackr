# SPDX-License-Identifier: AGPL-3.0-or-later
# app/models/job.py
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class JobOffer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    platform: Optional[str] = None
    date_scraped: datetime = Field(default_factory=datetime.now)
