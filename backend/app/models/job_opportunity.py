# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/models/job_opportunity.py

from datetime import UTC, datetime
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job_application import JobApplication
    from app.models.job_posting import JobPosting


class JobOpportunityPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class JobOpportunity(Base):
    __tablename__ = "job_opportunity"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid7,
    )

    job_postings: Mapped[list["JobPosting"]] = relationship(
        "JobPosting",
        back_populates="job_opportunity",
        cascade="all, delete-orphan",
        lazy="raise",
    )

    job_applications: Mapped[list["JobApplication"]] = relationship(
        "JobApplication",
        back_populates="job_opportunity",
        cascade="all, delete-orphan",
        lazy="raise",
    )

    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    url: Mapped[str | None] = mapped_column(String, nullable=True)

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    priority: Mapped[JobOpportunityPriority] = mapped_column(
        SAEnum(JobOpportunityPriority, name="job_opportunity_priority"),
        default=JobOpportunityPriority.LOW,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
