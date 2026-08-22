# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/candidacies/serializers.py

from typing import Any, cast

from django.utils.text import Truncator
from rest_framework import serializers

from apps.jobs.candidacies.models import JobCandidacy
from apps.jobs.postings.models import JobPosting
from apps.users.models import User


class JobPostingSummarySerializer(serializers.ModelSerializer[JobPosting]):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "company",
            "location",
        ]
        read_only_fields = tuple(fields)


class JobCandidacyListSerializer(serializers.ModelSerializer[JobCandidacy]):
    notes_preview = serializers.SerializerMethodField()

    job_posting = JobPostingSummarySerializer(
        read_only=True,
    )

    status_label = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = JobCandidacy
        fields = [
            "id",
            "job_posting",
            "status",
            "status_label",
            "applied_on",
            "notes_preview",
            "created_at",
            "updated_at",
        ]
        read_only_fields = tuple(fields)

    def get_notes_preview(self, obj: JobCandidacy) -> str:
        return Truncator(obj.notes).chars(100)


class JobCandidacyDetailSerializer(JobCandidacyListSerializer):
    class Meta(JobCandidacyListSerializer.Meta):
        fields = [
            *JobCandidacyListSerializer.Meta.fields,
            "notes",
        ]
        read_only_fields = tuple(fields)


class JobCandidacyWriteSerializer(serializers.ModelSerializer[JobCandidacy]):
    class Meta:
        model = JobCandidacy
        fields = [
            "job_posting",
            "status",
            "applied_on",
            "notes",
        ]

    job_posting = serializers.PrimaryKeyRelatedField(
        queryset=JobPosting.objects.none(),
    )

    def get_fields(self) -> dict[str, Any]:
        fields = super().get_fields()

        request = self.context.get("request")

        if request is not None and request.user.is_authenticated:
            user = cast(User, request.user)
            field = fields["job_posting"]
            if isinstance(field, serializers.PrimaryKeyRelatedField):
                field.queryset = JobPosting.objects.filter(owner=user)

        return fields

    def validate_job_posting(self, job_posting: JobPosting) -> JobPosting:
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        user = cast(User, request.user)

        if job_posting.owner.pk != user.pk:
            raise serializers.ValidationError("Invalid job posting.")

        if self.instance is not None and job_posting.pk != self.instance.job_posting.pk:
            raise serializers.ValidationError(
                "The job posting cannot be changed "
                "after the candidacy has been created."
            )

        if (
            self.instance is None
            and JobCandidacy.objects.filter(job_posting=job_posting).exists()
        ):
            raise serializers.ValidationError(
                "A candidacy already exists for this job posting."
            )

        return job_posting
