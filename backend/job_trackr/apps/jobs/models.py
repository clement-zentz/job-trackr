# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/models.py

from typing import TYPE_CHECKING

from django.db import models

from apps.common.uuid import uuid7_default

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager

    from apps.job_applications.models import JobApplication

    from .models import JobPosting


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

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    priority = models.CharField(
        max_length=10,
        choices=JobOpportunityPriority.choices,
        default=JobOpportunityPriority.LOW,
    )

    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    if TYPE_CHECKING:
        job_postings: "RelatedManager[JobPosting]"

    class Meta:
        db_table = "job_opportunity"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.company} - {self.title}"


class JobPosting(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    job_opportunity = models.ForeignKey(
        JobOpportunity,
        related_name="job_postings",
        on_delete=models.CASCADE,
    )

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, null=True, blank=True)

    rating = models.FloatField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    salary = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    raw_url = models.URLField()
    canonical_url = models.URLField(null=True, blank=True)
    job_key = models.CharField(max_length=255, null=True, blank=True)

    platform = models.CharField(max_length=50)
    ingestion_source = models.CharField(max_length=50, default="email")

    easy_apply = models.BooleanField(null=True, blank=True)
    active_hiring = models.BooleanField(null=True, blank=True)

    posted_at = models.DateTimeField(null=True, blank=True)
    date_scraped = models.DateTimeField(auto_now_add=True)

    source_email_id = models.CharField(max_length=255, null=True, blank=True)

    if TYPE_CHECKING:
        job_applications: "RelatedManager[JobApplication]"

    class Meta:
        db_table = "job_posting"
        constraints = [
            models.UniqueConstraint(
                fields=["platform", "job_key"],
                name="uq_job_posting_platform_job_key",
            )
        ]

    def __str__(self) -> str:
        return f"{self.platform} - {self.title}"
