# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/serializers.py

from rest_framework import serializers

from apps.jobs.postings.models import JobPosting


class JobPostingChoiceLabelsMixin(serializers.Serializer[JobPosting]):
    platform_label = serializers.CharField(
        source="get_platform_display",
        read_only=True,
    )
    employment_type_label = serializers.CharField(
        source="get_employment_type_display",
        read_only=True,
    )
    work_mode_label = serializers.CharField(
        source="get_work_mode_display",
        read_only=True,
    )


class JobPostingListSerializer(
    JobPostingChoiceLabelsMixin,
    serializers.ModelSerializer[JobPosting],
):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company",
            "location",
            "url",
            "easy_apply",
            "active_hiring",
            "platform",
            "platform_label",
            "employment_type",
            "employment_type_label",
            "work_mode",
            "work_mode_label",
            "posted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = tuple(fields)


class JobPostingDetailSerializer(
    JobPostingChoiceLabelsMixin,
    serializers.ModelSerializer[JobPosting],
):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company",
            "location",
            "url",
            "description",
            "salary",
            "easy_apply",
            "active_hiring",
            "platform",
            "platform_label",
            "employment_type",
            "employment_type_label",
            "work_mode",
            "work_mode_label",
            "posted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = tuple(fields)


class JobPostingWriteSerializer(serializers.ModelSerializer[JobPosting]):
    class Meta:
        model = JobPosting
        fields = [
            "title",
            "company",
            "location",
            "url",
            "salary",
            "description",
            "easy_apply",
            "active_hiring",
            "platform",
            "employment_type",
            "work_mode",
            "posted_at",
        ]
