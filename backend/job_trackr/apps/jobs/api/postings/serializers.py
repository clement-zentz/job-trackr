# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/serializers.py

from rest_framework import serializers

from apps.jobs.postings.models import JobPosting


class JobPostingListSerializer(serializers.ModelSerializer[JobPosting]):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company",
            "location",
            "platform",
            "raw_url",
            "canonical_url",
            "posted_at",
            "easy_apply",
            "active_hiring",
        ]
        read_only_fields = tuple(fields)


class JobPostingDetailSerializer(serializers.ModelSerializer[JobPosting]):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "job_opportunity",
            "title",
            "company",
            "platform",
            "raw_url",
            "canonical_url",
            "location",
            "summary",
            "salary",
            "description",
            "rating",
            "easy_apply",
            "active_hiring",
            "posted_at",
        ]
        read_only_fields = tuple(fields)


class JobPostingWriteSerializer(serializers.ModelSerializer[JobPosting]):
    class Meta:
        model = JobPosting
        fields = [
            "job_opportunity",
            "title",
            "company",
            "platform",
            "raw_url",
            "canonical_url",
            "job_key",
            "location",
            "summary",
            "salary",
            "description",
            "rating",
            "easy_apply",
            "active_hiring",
            "posted_at",
        ]
