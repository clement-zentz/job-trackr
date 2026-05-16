# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/filters.py

from django.db.models import QuerySet
from django_filters import rest_framework as filters

from apps.jobs.postings.choices import Platforms
from apps.jobs.postings.models import JobPosting


class JobPostingFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr="icontains")
    company = filters.CharFilter(lookup_expr="icontains")
    location = filters.CharFilter(lookup_expr="icontains")

    platform = filters.ChoiceFilter(choices=Platforms.choices)

    easy_apply = filters.BooleanFilter()
    active_hiring = filters.BooleanFilter()

    posted_at_after = filters.IsoDateTimeFilter(
        field_name="posted_at",
        lookup_expr="gte",
    )
    posted_at_before = filters.IsoDateTimeFilter(
        field_name="posted_at",
        lookup_expr="lte",
    )

    has_salary = filters.BooleanFilter(method="filter_has_salary")
    has_candidacy = filters.BooleanFilter(method="filter_has_candidacy")

    class Meta:
        model = JobPosting
        fields = [
            "platform",
            "easy_apply",
            "active_hiring",
        ]

    def filter_has_salary(
        self,
        queryset: QuerySet[JobPosting],
        name: str,
        value: bool,
    ) -> QuerySet[JobPosting]:
        if value:
            return queryset.exclude(salary="")
        return queryset.filter(salary="")

    def filter_has_candidacy(
        self,
        queryset: QuerySet[JobPosting],
        name: str,
        value: bool,
    ) -> QuerySet[JobPosting]:
        if value:
            return queryset.filter(candidacy__isnull=False)
        return queryset.filter(candidacy__isnull=True)
