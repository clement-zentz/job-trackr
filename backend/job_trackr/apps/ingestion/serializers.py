# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/serializers.py

from rest_framework import serializers

from .models import IngestedJobPosting, IngestionSource


class IngestedJobPostingInputSerializer(serializers.Serializer):
    """
    Payload received from FastAPI ingestion service.
    """

    # --- Job Required fields ---
    title = serializers.CharField(max_length=255)
    company = serializers.CharField(max_length=255)
    raw_url = serializers.URLField(max_length=2000)
    platform = serializers.CharField(max_length=50)

    # --- Job Optional fields (null and blank) ---
    location = serializers.CharField(
        max_length=255,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    canonical_url = serializers.URLField(
        max_length=2000,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    job_key = serializers.CharField(
        max_length=255,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    salary = serializers.CharField(
        max_length=255,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    summary = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    description = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    # --- Job Optional fields (null only) ---
    rating = serializers.FloatField(required=False, allow_null=True)
    easy_apply = serializers.BooleanField(required=False, allow_null=True)
    active_hiring = serializers.BooleanField(required=False, allow_null=True)
    posted_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs):
        """
        Normalize optional non-identity text fields so that blank strings are stored
        as None.

        This keeps a single internal representation for "no value" for descriptive
        fields, while still allowing both null and blank input at the API boundary.

        Fields that participate in fingerprinting (e.g. job_key, canonical_url) are
        intentionally excluded from this normalization to preserve the distinction
        between None and empty string for deduplication semantics.
        """
        for field in (
            "location",
            "salary",
            "summary",
            "description",
            "source_event_id",
        ):
            if attrs.get(field) == "":
                attrs[field] = None
        return attrs

    # --- Ingestion metadata ---
    ingestion_source = serializers.ChoiceField(
        choices=IngestionSource.choices,
    )
    source_event_id = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )


class IngestedJobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestedJobPosting
        fields = (
            "id",
            # Job data (required)
            "title",
            "company",
            "platform",
            "raw_url",
            # Job data (optional)
            "location",
            "canonical_url",
            "job_key",
            "description",
            "summary",
            "salary",
            "rating",
            "posted_at",
            "easy_apply",
            "active_hiring",
            # Ingestion metadata
            "ingestion_source",
            "source_event_id",
            "fingerprint",
            # Workflow fields
            "status",
            "error_message",
            "ingested_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "ingested_at",
            "updated_at",
            "source_event_id",
            "status",
            "error_message",
            "fingerprint",
        )
