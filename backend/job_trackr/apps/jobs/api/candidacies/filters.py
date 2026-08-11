# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/candidacies/filters.py

from django_filters import rest_framework as filters

from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode


class JobCandidacyFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=CandidacyStatus.choices)

    applied_on_after = filters.DateFilter(
        field_name="applied_on",
        lookup_expr="gte",
    )
    applied_on_before = filters.DateFilter(
        field_name="applied_on",
        lookup_expr="lte",
    )

    platform = filters.ChoiceFilter(
        field_name="job_posting__platform",
        choices=Platforms.choices,
    )
    employment_type = filters.ChoiceFilter(
        field_name="job_posting__employment_type",
        choices=EmploymentType.choices,
    )
    work_mode = filters.ChoiceFilter(
        field_name="job_posting__work_mode",
        choices=WorkMode.choices,
    )

    class Meta:
        model = JobCandidacy
        fields = [
            "status",
            "platform",
            "employment_type",
            "work_mode",
        ]
