# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/postings/views.py

from typing import Any

from django.db import IntegrityError
from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer

from apps.jobs.postings.models import JobPosting

from .serializers import (
    JobPostingDetailSerializer,
    JobPostingListSerializer,
    JobPostingWriteSerializer,
)


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/v1/jobs/postings/
    - retrieve(): GET /api/v1/jobs/postings/{id}/
    - create(): POST /api/v1/jobs/postings/
    - partial_update(): PATCH /api/v1/jobs/postings/{id}/
    - destroy(): DELETE /api/v1/jobs/postings/{id}/
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # -------------------------
    # Querysets
    # -------------------------

    def _detail_queryset(self) -> QuerySet[JobPosting]:
        return JobPosting.objects.select_related("job_opportunity")

    def get_queryset(self) -> QuerySet[JobPosting]:
        if self.action in ("retrieve", "create", "update", "partial_update"):
            return self._detail_queryset()

        return JobPosting.objects.all()

    # -------------------------
    # Serializers
    # -------------------------

    def get_serializer_class(self) -> type[BaseSerializer]:
        if self.action in ("create", "update", "partial_update"):
            return JobPostingWriteSerializer
        if self.action == "retrieve":
            return JobPostingDetailSerializer

        return JobPostingListSerializer

    # -------------------------
    # Create
    # -------------------------

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
        except IntegrityError:
            return Response(
                {"detail": "A job posting with the same identity already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        # Re-fetch with enriched queryset
        instance = self._detail_queryset().get(pk=instance.pk)

        response_serializer = JobPostingDetailSerializer(
            instance,
            context=self.get_serializer_context(),
        )

        headers = self.get_success_headers(serializer.data)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    # -------------------------
    # Update
    # -------------------------

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(raise_exception=True)

        # posting_fingerprint is computed only on create --> no IntegrityError expected
        instance = serializer.save()

        # Re-fetch with enriched queryset
        instance = self._detail_queryset().get(pk=instance.pk)

        response_serializer = JobPostingDetailSerializer(
            instance,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
