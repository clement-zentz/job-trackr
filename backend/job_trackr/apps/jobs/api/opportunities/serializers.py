# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/opportunities/serializers.py

from rest_framework import serializers

from apps.jobs.opportunities.models import JobOpportunity
from apps.jobs.postings.models import JobPosting


class JobOpportunityPostingSerializer(serializers.ModelSerializer[JobPosting]):
    """
    Serializer exposing JobPosting records attached to a JobOpportunity.
    """

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "platform",
            "raw_url",
            "canonical_url",
            "posted_at",
        ]
        read_only_fields = tuple(fields)


class JobOpportunityWriteSerializer(serializers.ModelSerializer[JobOpportunity]):
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
            "description",
            "notes",
            "priority",
        ]


class JobOpportunityListSerializer(serializers.ModelSerializer[JobOpportunity]):
    """
    Serializer used to expose JobOpportunity data to the
    frontend JobOpportunityList page. Includes aggregated
    metadata derived from related JobPosting records.
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
            "description",
            "priority",
            "updated_at",
            "postings_count",
            "latest_posted_at",
        ]
        read_only_fields = tuple(fields)


class JobOpportunityDetailSerializer(serializers.ModelSerializer[JobOpportunity]):
    """
    Serializer used to expose JobOpportunity data to the
    frontend JobOpportunityDetail page. Includes aggregated
    metadata derived from related JobPosting records.
    """

    postings_count = serializers.IntegerField(read_only=True)
    latest_posted_at = serializers.DateTimeField(read_only=True)

    job_postings = JobOpportunityPostingSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = JobOpportunity
        fields = [
            "id",
            "title",
            "company",
            "location",
            "description",
            "notes",
            "priority",
            "updated_at",
            "postings_count",
            "latest_posted_at",
            "job_postings",
        ]
        read_only_fields = tuple(fields)
