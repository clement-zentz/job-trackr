# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/views.py

from typing import Any

from django.db import IntegrityError
from django.db.models import Count, Max, QuerySet
from rest_framework import serializers, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.ingestion.auth import IngestionApiKeyAuthentication
from apps.jobs.models import JobOpportunity
from apps.jobs.serializers import (
    JobOpportunityReadSerializer,
    JobOpportunityWriteSerializer,
)


class JobOpportunityViewSet(viewsets.ModelViewSet[JobOpportunity]):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/v1/jobs/opportunities/
    - retrieve(): GET /api/v1/jobs/opportunities/{id}
    - create(): POST /api/v1/jobs/opportunities/
    - partial_update(): PATCH /api/v1/jobs/opportunities/{id}
    - destroy(): DELETE /api/v1/jobs/opportunities/{id}
    """

    authentication_classes = [IngestionApiKeyAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[JobOpportunity]:
        queryset = JobOpportunity.objects.filter(is_active=True)

        if self.action in ("list", "retrieve"):
            queryset = queryset.annotate(
                postings_count=Count("job_postings"),
                latest_posted_at=Max("job_postings__posted_at"),
            )

        return queryset.order_by("-updated_at")

    def get_serializer_class(self) -> type[serializers.BaseSerializer[Any]]:
        if self.action in ("create", "update", "partial_update"):
            return JobOpportunityWriteSerializer
        return JobOpportunityReadSerializer

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
        except IntegrityError:
            return Response(
                {"detail": "A job opportunity with the same identity already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        response_serializer = JobOpportunityReadSerializer(instance)
        headers = self.get_success_headers(serializer.data)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
        except IntegrityError:
            return Response(
                {"detail": "A job opportunity with the same identity already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        response_serializer = JobOpportunityReadSerializer(instance)

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
