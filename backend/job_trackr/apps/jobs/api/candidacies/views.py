# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/candidacies/views.py

from django.db.models import QuerySet
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.jobs.api.base_viewsets import ReadAfterWriteModelViewSet
from apps.jobs.candidacies.models import JobCandidacy

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

    def get_queryset(self) -> QuerySet[JobCandidacy]:
        return JobCandidacy.objects.select_related("job_posting")
