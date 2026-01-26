# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/models.py

from uuid import UUID

from django.db import models
from uuid6 import uuid7


def uuid7_default() -> UUID:
    return uuid7()


class IngestionStatus(models.TextChoices):
    RECEIVED = "received", "Received"
    PROCESSED = "processed", "Processed"
    DUPLICATE = "duplicate", "Duplicate"
    FAILED = "failed", "Failed"


class IngestedJobPosting(models.Model):
    """
    Raw / semi-normalized job posting received from FastAPI ingestion service.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    # --- Source metadata ---
    source = models.CharField(max_length=50)
    source_event_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Message ID, webhook ID, or batch ID",
    )

    ingested_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=IngestionStatus.choices,
        default=IngestionStatus.RECEIVED,
    )

    error_message = models.TextField(null=True, blank=True)

    # --- Job data (semi-normalized) ---
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, null=True, blank=True)

    raw_url = models.URLField()
    canonical_url = models.URLField(null=True, blank=True)
    job_key = models.CharField(max_length=255, null=True, blank=True)
    platform = models.CharField(max_length=50)

    description = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    salary = models.CharField(max_length=255, null=True, blank=True)

    posted_at = models.DateTimeField(null=True, blank=True)

    # --- Dedup helpers ---
    fingerprint = models.CharField(
        max_length=64,
        help_text="Hash used for deduplication",
    )

    class Meta:
        db_table = "ingested_job_posting"
        indexes = [
            models.Index(fields=["fingerprint"]),
            models.Index(fields=["platform", "job_key"]),
        ]

    def __str__(self) -> str:
        return f"{self.platform} - {self.title}"
