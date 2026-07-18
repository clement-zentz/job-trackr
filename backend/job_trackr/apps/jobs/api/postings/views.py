# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/views.py

from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.jobs.api.base_viewsets import ReadAfterWriteModelViewSet
from apps.jobs.postings.models import JobPosting

from .filters import JobPostingFilter
from .serializers import (
    JobPostingDetailSerializer,
    JobPostingListSerializer,
    JobPostingWriteSerializer,
)


class JobPostingViewSet(ReadAfterWriteModelViewSet[JobPosting]):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/v1/jobs/postings/
    - retrieve(): GET /api/v1/jobs/postings/{id}/
    - create(): POST /api/v1/jobs/postings/
    - update(): PUT /api/v1/jobs/postings/{id}/
    - partial_update(): PATCH /api/v1/jobs/postings/{id}/
    - destroy(): DELETE /api/v1/jobs/postings/{id}/
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = JobPostingDetailSerializer
    list_serializer_class = JobPostingListSerializer
    write_serializer_class = JobPostingWriteSerializer

    # --- Search, Order, Filter ---
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = JobPostingFilter

    search_fields = [
        "title",
        "company",
        "location",
        "description",
    ]

    ordering_fields = [
        "posted_at",
        "created_at",
        "updated_at",
        "company",
        "title",
        "platform",
    ]
    ordering = ["-posted_at", "-created_at"]

    def get_queryset(self) -> QuerySet[JobPosting]:
        return JobPosting.objects.select_related("candidacy")
