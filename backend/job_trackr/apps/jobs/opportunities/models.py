# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/opportunities/models.py

from typing import TYPE_CHECKING, Any

from django.db import models

from apps.common.uuid import uuid7_default

from .services.opportunity_identity import compute_opportunity_key

if TYPE_CHECKING:
    from django_stubs_ext.db.models.manager import RelatedManager

    from apps.jobs.postings.models import JobPosting


class JobOpportunityPriority(models.TextChoices):
    HIGH = "high", "High"
    MEDIUM = "medium", "Medium"
    LOW = "low", "Low"


class JobOpportunity(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )
    # --- Job Required Fields ---
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)

    # --- Job Optional Fields ---
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    priority = models.CharField(
        max_length=10,
        choices=JobOpportunityPriority.choices,
        default=JobOpportunityPriority.LOW,
    )

    # --- Metadata ---
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Stable identity key used by the ingestion pipeline to identify a logical
    # job opportunity. It is derived from the original identity fields
    # (title, company, location) and computed on creation. It is intentionally
    # not recomputed on updates to preserve deduplication guarantees and
    # relationship stability.
    opportunity_key = models.CharField(
        max_length=64,
        null=False,
        editable=False,
    )

    if TYPE_CHECKING:
        job_postings: "RelatedManager[JobPosting]"

    class Meta:
        db_table = "job_opportunity"
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["opportunity_key"],
                name="uq_job_opo_key",
            )
        ]

    def save(self, *args: Any, **kwargs: Any) -> None:
        if self._state.adding and not self.opportunity_key:
            self.opportunity_key = compute_opportunity_key(
                title=self.title,
                company=self.company,
                location=self.location or None,
            )
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.company} - {self.title}"
