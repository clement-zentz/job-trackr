# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/views.py

from django.db.models import Count, Max
from rest_framework import viewsets

from apps.jobs.models import JobOpportunity

from .serializers import (
    JobOpportunityReadSerializer,
    JobOpportunityWriteSerializer,
)


class JobOpportunityViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/job-opportunities/
    - retrieve(): GET /api/job-opportunities/{id}
    - create(): POST /api/job-opportunities/
    - partial_update(): PATCH /api/job-opportunities/{id}
    - destroy(): DELETE /api/job-opportunities/{id}
    """

    def get_queryset(self):
        queryset = JobOpportunity.objects.filter(is_active=True)

        if self.action == "list":
            queryset = queryset.annotate(
                postings_count=Count("job_postings"),
                latest_posted_at=Max("job_postings__posted_at"),
            )

        return queryset.order_by("-updated_at")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return JobOpportunityWriteSerializer
        return JobOpportunityReadSerializer
