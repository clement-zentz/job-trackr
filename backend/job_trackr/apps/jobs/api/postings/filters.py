# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/filters.py

from django_filters import rest_framework as filters

from apps.jobs.postings.models import JobPosting


class JobPostingFilter(filters.FilterSet):
    company = filters.CharFilter(field_name="company", lookup_expr="icontains")
    title = filters.CharFilter(field_name="title", lookup_expr="icontains")
    location = filters.CharFilter(field_name="location", lookup_expr="icontains")
    platform = filters.CharFilter(field_name="platform", lookup_expr="iexact")

    easy_apply = filters.BooleanFilter(field_name="easy_apply")
    active_hiring = filters.BooleanFilter(field_name="active_hiring")

    posted_at_after = filters.IsoDateTimeFilter(
        field_name="posted_at",
        lookup_expr="gte",
    )
    posted_at_before = filters.IsoDateTimeFilter(
        field_name="posted_at",
        lookup_expr="lte",
    )

    rating_min = filters.NumberFilter(field_name="rating", lookup_expr="gte")
    rating_max = filters.NumberFilter(field_name="rating", lookup_expr="lte")

    has_salary = filters.BooleanFilter(method="filter_has_salary")
    has_job_opportunity = filters.BooleanFilter(method="filter_has_job_opportunity")

    class Meta:
        model = JobPosting
        fields = [
            "platform",
            "easy_apply",
            "active_hiring",
        ]

    def filter_has_salary(self, queryset, name, value):  # type: ignore[no-untyped-def]
        if value is True:
            return queryset.exclude(salary="")
        if value is False:
            return queryset.filter(salary="")
        return queryset

    def filter_has_job_opportunity(self, queryset, name, value):  # type: ignore[no-untyped-def]
        if value is True:
            return queryset.filter(job_opportunity__isnull=False)
        if value is False:
            return queryset.filter(job_opportunity__isnull=True)
        return queryset
