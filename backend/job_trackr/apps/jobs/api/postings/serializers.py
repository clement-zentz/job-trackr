# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/serializers.py

from rest_framework import serializers

from apps.jobs.postings.models import JobPosting


class JobPostingReadSerializer(serializers.ModelSerializer[JobPosting]):
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
