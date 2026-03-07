# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/serializers.py

from rest_framework import serializers

from apps.jobs.models import JobOpportunity


class JobOpportunityWriteSerializer(serializers.ModelSerializer):
    """
    Serializer used when creating or updating JobOpportunity objects
    from the frontend UI.
    """

    class Meta:
        model = JobOpportunity
        fields = [
            "title",
            "company",
            "location",
            "url",
            "notes",
            "priority",
        ]


class JobOpportunityReadSerializer(serializers.ModelSerializer):
    """
    Serializer used to expose JobOpportunity data to the frontend.
    Includes aggregated metadata derived from related JobPosting records.
    """

    postings_count = serializers.IntegerField(read_only=True)
    latest_posted_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = JobOpportunity
        fields = [
            "id",
            "title",
            "company",
            "location",
            "url",
            "notes",
            "priority",
            "is_active",
            "created_at",
            "updated_at",
            "postings_count",
            "latest_posted_at",
        ]
        read_only_fields = fields
