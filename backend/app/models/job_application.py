# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/models/job_application.py

from datetime import UTC, date, datetime
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job_opportunity import JobOpportunity


class JobApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    TECHNICAL_TEST = "technical_test"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class JobApplication(Base):
    __tablename__ = "job_application"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid7,
    )

    job_opportunity_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey(
            "job_opportunity.id",
            ondelete="CASCADE",
            name="fk_job_application_job_opportunity",
        ),
        nullable=False,
        index=True,
    )

    job_opportunity: Mapped["JobOpportunity"] = relationship(
        "JobOpportunity",
        back_populates="job_applications",
        lazy="raise",
    )

    status: Mapped[JobApplicationStatus] = mapped_column(
        SAEnum(JobApplicationStatus, name="job_application_status"),
        default=JobApplicationStatus.APPLIED,
        nullable=False,
    )

    job_application_date: Mapped[date] = mapped_column(Date, nullable=False)

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
