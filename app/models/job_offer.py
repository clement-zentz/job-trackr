# SPDX-License-Identifier: AGPL-3.0-or-later
# app/models/job_offer.py

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# Base for all SQLAlchemy models
class Base(DeclarativeBase):
    pass


class JobOffer(Base):
    __tablename__ = "joboffer"

    id: Mapped[int | None] = mapped_column(primary_key=True, autoincrement=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=True)

    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    salary: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    url: Mapped[str] = mapped_column(String, nullable=False, index=True)
    platform: Mapped[str] = mapped_column(String, nullable=False)

    easy_apply: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    active_hiring: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    posted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    date_scraped: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    source_email_id: Mapped[str | None] = mapped_column(String, nullable=True)
