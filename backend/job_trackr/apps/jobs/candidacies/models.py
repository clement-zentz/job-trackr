# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/candidacies/models.py

from datetime import date

from django.db import models
from django.utils.encoding import force_str

from apps.common.uuid import uuid7_default
from apps.jobs.candidacies.choices import CandidacyStatus


class JobCandidacy(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    job_posting = models.OneToOneField(
        "jobs.JobPosting",
        related_name="candidacy",
        on_delete=models.CASCADE,
    )

    status = models.CharField(
        max_length=50,
        choices=CandidacyStatus.choices,
        default=CandidacyStatus.APPLIED,
    )

    applied_on = models.DateField(default=date.today)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_candidacy"
        verbose_name = "job candidacy"
        verbose_name_plural = "job candidacies"
        ordering = ["-applied_on", "-created_at"]
        indexes = [
            models.Index(fields=["status"], name="idx_job_cand_status"),
            models.Index(fields=["applied_on"], name="idx_job_cand_applied"),
        ]

    def __str__(self) -> str:
        return f"{self.job_posting} ({self.status_label()})"

    def status_label(self) -> str:
        return force_str(CandidacyStatus(self.status).label)
