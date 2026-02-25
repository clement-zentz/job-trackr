# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/models.py

from django.db import models

from apps.common.uuid import uuid7_default


class IngestionStatus(models.TextChoices):
    RECEIVED = "received", "Received"
    PROCESSED = "processed", "Processed"
    DUPLICATE = "duplicate", "Duplicate"
    FAILED = "failed", "Failed"


class IngestionSource(models.TextChoices):
    EMAIL = "email", "Email"
    API = "api", "API"
    WEBHOOK = "webhook", "Webhook"


class IngestedJobPosting(models.Model):
    """
    Raw / semi-normalized job posting received from FastAPI ingestion service.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid7_default,
        editable=False,
    )

    # --- Job Required fields ----
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    platform = models.CharField(max_length=50)
    raw_url = models.URLField(max_length=2000)

    # --- Job Optional fields  ---
    location = models.CharField(max_length=255, null=True, blank=True)
    canonical_url = models.URLField(max_length=2000, null=True, blank=True)
    job_key = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    salary = models.CharField(max_length=255, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    easy_apply = models.BooleanField(null=True, blank=True)
    active_hiring = models.BooleanField(null=True, blank=True)

    # --- Ingestion metadata ---
    ingestion_source = models.CharField(
        max_length=50,
        choices=IngestionSource.choices,
        default=IngestionSource.EMAIL,
        help_text="How the job entered the system, example: email, api, ...",
    )
    source_event_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Message ID, webhook ID, or batch ID",
    )
    fingerprint = models.CharField(
        max_length=64,
        help_text="Hash used for deduplication",
    )

    # --- Workflow / system fields ---
    status = models.CharField(
        max_length=20,
        choices=IngestionStatus.choices,
        default=IngestionStatus.RECEIVED,
    )
    error_message = models.TextField(null=True, blank=True)
    ingested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    # --- Foreign Keys ---
    job_posting = models.ForeignKey(
        "jobs.JobPosting",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="ingested_rows",
    )

    job_opportunity = models.ForeignKey(
        "jobs.JobOpportunity",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="ingested_rows",
    )

    class Meta:
        db_table = "ingested_job_posting"
        constraints = [
            models.UniqueConstraint(
                fields=["fingerprint"],
                name="uniq_ing_job_fp",
            ),
        ]
        indexes = [
            models.Index(
                fields=["platform", "job_key"],
                name="idx_ing_job_plat_key",
            ),
            models.Index(
                fields=["status", "ingested_at"],
                name="idx_ing_job_status_ts",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.platform} - {self.title}"
