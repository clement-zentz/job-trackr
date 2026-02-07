# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/job_applications/models.py

from datetime import date

from django.db import models

from apps.common.uuid import uuid7_default
from apps.jobs.models import JobOpportunity, JobPosting


class JobApplicationStatus(models.TextChoices):
    APPLIED = "applied", "Applied"
    INTERVIEW = "interview", "Interview"
    TECHNICAL_TEST = "technical_test", "Technical test"
    OFFER = "offer", "Offer"
    REJECTED = "rejected", "Rejected"
    WITHDRAWN = "withdrawn", "Withdrawn"


class JobApplication(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    # --- Job Application FK Fields ---
    job_opportunity = models.ForeignKey(
        JobOpportunity,
        related_name="job_applications",
        on_delete=models.CASCADE,
    )

    job_posting = models.ForeignKey(
        JobPosting,
        related_name="job_applications",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    # --- Job Application Fields ---
    job_application_date = models.DateField(default=date.today)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=JobApplicationStatus.choices,
        default=JobApplicationStatus.APPLIED,
    )

    # --- Metadata ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_application"

    def __str__(self) -> str:
        return f"{self.job_opportunity} ({self.status})"
