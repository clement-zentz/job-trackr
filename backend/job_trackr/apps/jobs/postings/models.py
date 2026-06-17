# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/models.py

from django.db import models

from apps.common.uuid import uuid7_default
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode


class JobPosting(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    url = models.URLField(max_length=2000, blank=True)
    description = models.TextField(blank=True)
    salary = models.CharField(max_length=255, blank=True)
    easy_apply = models.BooleanField(default=False)
    active_hiring = models.BooleanField(default=False)
    posted_at = models.DateTimeField(null=True, blank=True)

    platform = models.CharField(
        max_length=50,
        choices=Platforms.choices,
        blank=True,
    )
    employment_type = models.CharField(
        max_length=50,
        choices=EmploymentType.choices,
        blank=True,
    )
    work_mode = models.CharField(
        max_length=50,
        choices=WorkMode.choices,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_posting"
        ordering = ["-posted_at", "-created_at"]
        indexes = [
            models.Index(fields=["platform"], name="idx_job_post_platform"),
            models.Index(fields=["easy_apply"], name="idx_job_post_easy"),
            models.Index(fields=["active_hiring"], name="idx_job_post_active"),
            models.Index(fields=["posted_at"], name="idx_job_post_posted"),
            # Note: `company` is filtered using `icontains` (ILIKE '%...%'),
            # so this btree index is not used for that query pattern.
            # It is kept for potential exact/prefix queries and general use.
            models.Index(fields=["company"], name="idx_job_post_company"),
        ]

    def __str__(self) -> str:
        return f"{self.title} at {self.company}"
