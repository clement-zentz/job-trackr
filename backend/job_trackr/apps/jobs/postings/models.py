# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/models.py

from typing import TYPE_CHECKING, Any
from uuid import UUID

from django.db import models

from apps.common.uuid import uuid7_default
from apps.ingestion.services.fingerprint import compute_fingerprint

if TYPE_CHECKING:
    from django_stubs_ext.db.models.manager import RelatedManager

    from apps.job_applications.models import JobApplication


class JobPosting(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    job_opportunity = models.ForeignKey(
        "jobs.JobOpportunity",
        related_name="job_postings",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    # --- Job Required Fields ---
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    raw_url = models.URLField(max_length=2000)
    platform = models.CharField(max_length=50)

    # --- Job Optional String Fields ---
    location = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    salary = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    canonical_url = models.URLField(max_length=2000, blank=True)
    job_key = models.CharField(max_length=255, blank=True)
    # --- Job Other type Fields ---
    rating = models.FloatField(null=True, blank=True)
    easy_apply = models.BooleanField(default=False)
    active_hiring = models.BooleanField(default=False)
    posted_at = models.DateTimeField(null=True, blank=True)

    # --- Metadata ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # posting_fingerprint is a stable identity hash used for ingestion
    # deduplication. It is computed only on creation and intentionally
    # not recomputed on updates.
    posting_fingerprint = models.CharField(
        max_length=64,
        null=False,
        editable=False,
    )

    if TYPE_CHECKING:
        job_applications: "RelatedManager[JobApplication]"
        job_opportunity_id: UUID | None

    class Meta:
        db_table = "job_posting"
        ordering = ["-posted_at"]
        indexes = [
            models.Index(fields=["platform"], name="idx_job_post_platform"),
            models.Index(fields=["easy_apply"], name="idx_job_post_easy"),
            models.Index(fields=["active_hiring"], name="idx_job_post_active"),
            models.Index(fields=["posted_at"], name="idx_job_post_posted"),
            models.Index(fields=["company"], name="idx_job_post_company"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["posting_fingerprint"],
                name="uq_job_posting_fp",
            )
        ]

    def save(self, *args: Any, **kwargs: Any) -> None:
        if self._state.adding and not self.posting_fingerprint:
            self.posting_fingerprint = compute_fingerprint(
                platform=self.platform,
                job_key=self.job_key,
                canonical_url=self.canonical_url,
                title=self.title,
                company=self.company,
                location=self.location,
            )
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.platform} - {self.title}"
