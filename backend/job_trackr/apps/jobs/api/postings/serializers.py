# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/serializers.py

from django.utils.text import Truncator
from rest_framework import serializers

from apps.jobs.postings.models import JobPosting


class JobPostingListSerializer(serializers.ModelSerializer[JobPosting]):
    description_preview = serializers.SerializerMethodField()
    candidacy_id = serializers.SerializerMethodField()

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

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company",
            "location",
            "url",
            "description_preview",
            "salary",
            "easy_apply",
            "active_hiring",
            "platform",
            "platform_label",
            "employment_type",
            "employment_type_label",
            "work_mode",
            "work_mode_label",
            "candidacy_id",
            "posted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = tuple(fields)

    def get_description_preview(self, obj: JobPosting) -> str:
        return Truncator(obj.description).chars(240)

    def get_candidacy_id(self, obj: JobPosting) -> str | None:
        candidacy = getattr(obj, "candidacy", None)

        if candidacy is None:
            return None

        return str(candidacy.id)


class JobPostingDetailSerializer(JobPostingListSerializer):
    class Meta(JobPostingListSerializer.Meta):
        fields = [
            *JobPostingListSerializer.Meta.fields,
            "description",
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
