# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/candidacies/serializers.py

from django.utils.text import Truncator
from rest_framework import serializers

from apps.jobs.candidacies.models import JobCandidacy
from apps.jobs.postings.models import JobPosting


class JobCandidacyListSerializer(serializers.ModelSerializer[JobCandidacy]):
    notes_preview = serializers.SerializerMethodField()

    class Meta:
        model = JobCandidacy
        fields = [
            "id",
            "job_posting",
            "status",
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

    def validate_job_posting(self, job_posting: JobPosting) -> JobPosting:
        if self.instance is not None and job_posting.pk != self.instance.job_posting.pk:
            raise serializers.ValidationError(
                "The job posting cannot be changed "
                "after the candidacy has been created."
            )

        return job_posting
