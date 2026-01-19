# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/models/job_posting.py

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job_opportunity import JobOpportunity


class JobPosting(Base):
    __tablename__ = "job_posting"

    __table_args__ = (
        UniqueConstraint(
            "platform",
            "job_key",
            name="uq_job_posting_platform_job_key",
        ),
        UniqueConstraint(
            "raw_url",
            name="uq_job_posting_raw_url",
        ),
    )

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
            name="fk_job_posting_job_opportunity",
        ),
        nullable=False,
        index=True,
    )

    job_opportunity: Mapped["JobOpportunity"] = relationship(
        "JobOpportunity",
        back_populates="job_postings",
        lazy="raise",
    )

    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str | None] = mapped_column(String, nullable=True)

    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    salary: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    raw_url: Mapped[str] = mapped_column(String, nullable=False)
    canonical_url: Mapped[str | None] = mapped_column(String, nullable=True)
    job_key: Mapped[str | None] = mapped_column(String, nullable=True)

    platform: Mapped[str] = mapped_column(String, nullable=False)
    ingestion_source: Mapped[str] = mapped_column(
        String, nullable=False, default="email"
    )

    easy_apply: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    active_hiring: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    posted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    date_scraped: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    source_email_id: Mapped[str | None] = mapped_column(String, nullable=True)
