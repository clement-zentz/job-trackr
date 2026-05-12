# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/candidacies/models.py

from datetime import date

from django.db import models

from apps.common.uuid import uuid7_default


class JobCandidacyStatus(models.TextChoices):
    APPLIED = "applied", "Applied"
    INTERVIEW = "interview", "Interview"
    TECHNICAL_TEST = "technical_test", "Technical test"
    OFFER = "offer", "Offer"
    REJECTED = "rejected", "Rejected"
    WITHDRAWN = "withdrawn", "Withdrawn"


class JobCandidacy(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    # --- Job Candidacy FK Fields ---
    job_posting = models.ForeignKey(
        "jobs.JobPosting",
        related_name="job_candidacy",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    # --- Job Candidacy Fields ---
    job_candidacy_date = models.DateField(default=date.today)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=JobCandidacyStatus.choices,
        default=JobCandidacyStatus.APPLIED,
    )

    # --- Metadata ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_candidacy"

    def __str__(self) -> str:
        return f"{self.job_posting.title} ({self.status})"
