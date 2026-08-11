# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/candidacies/views.py

from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.jobs.api.base_viewsets import ReadAfterWriteModelViewSet
from apps.jobs.candidacies.models import JobCandidacy

from .filters import JobCandidacyFilter
from .serializers import (
    JobCandidacyDetailSerializer,
    JobCandidacyListSerializer,
    JobCandidacyWriteSerializer,
)


class JobCandidacyViewSet(ReadAfterWriteModelViewSet[JobCandidacy]):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/v1/jobs/candidacies/
    - retrieve(): GET /api/v1/jobs/candidacies/{id}/
    - create(): POST /api/v1/jobs/candidacies/
    - update(): PUT /api/v1/jobs/candidacies/{id}/
    - partial_update(): PATCH /api/v1/jobs/candidacies/{id}/
    - destroy(): DELETE /api/v1/jobs/candidacies/{id}/
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = JobCandidacyDetailSerializer
    list_serializer_class = JobCandidacyListSerializer
    write_serializer_class = JobCandidacyWriteSerializer

    # --- Search, Order, Filter ---

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = JobCandidacyFilter

    search_fields = [
        "job_posting__title",
        "job_posting__company",
        "job_posting__location",
        "notes",
    ]

    ordering_fields = [
        "applied_on",
        "created_at",
        "updated_at",
    ]

    ordering = ["-applied_on", "-created_at"]

    def get_queryset(self) -> QuerySet[JobCandidacy]:
        return JobCandidacy.objects.select_related("job_posting")
