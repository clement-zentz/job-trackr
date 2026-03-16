# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/views.py

from typing import Any

from django.db import IntegrityError
from django.db.models import Count, Max, QuerySet
from rest_framework import serializers, status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.jobs.models import JobOpportunity
from apps.jobs.serializers import (
    JobOpportunityDetailSerializer,
    JobOpportunityListSerializer,
    JobOpportunityWriteSerializer,
)


class JobOpportunityViewSet(viewsets.ModelViewSet[JobOpportunity]):
    """
    ModelViewSet automatically provides:

    - list(): GET /api/v1/jobs/opportunities/
    - retrieve(): GET /api/v1/jobs/opportunities/{id}/
    - create(): POST /api/v1/jobs/opportunities/
    - partial_update(): PATCH /api/v1/jobs/opportunities/{id}/
    - destroy(): DELETE /api/v1/jobs/opportunities/{id}/
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def _annotated_queryset(self) -> QuerySet[JobOpportunity]:
        qs = JobOpportunity.objects.filter(is_active=True).annotate(
            postings_count=Count("job_postings"),
            latest_posted_at=Max("job_postings__posted_at"),
        )

        if self.action in ("retrieve", "create", "update", "partial_update"):
            qs = qs.prefetch_related("job_postings")

        return qs

    def get_queryset(self) -> QuerySet[JobOpportunity]:
        if self.action in ("list", "retrieve"):
            return self._annotated_queryset().order_by("-updated_at")

        return JobOpportunity.objects.filter(is_active=True).order_by("-updated_at")

    def get_serializer_class(self) -> type[serializers.BaseSerializer[Any]]:
        if self.action in ("create", "update", "partial_update"):
            return JobOpportunityWriteSerializer
        if self.action == "retrieve":
            return JobOpportunityDetailSerializer

        return JobOpportunityListSerializer

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

        # Re-fetch with annotated queryset for consistent response shape
        instance = self._annotated_queryset().get(pk=instance.pk)

        response_serializer = JobOpportunityDetailSerializer(
            instance,
            context=self.get_serializer_context(),
        )

        # Restore DRF default behavior: attempt to include a Location header for the
        # created resource. DRF derives this header from a `url` field in the serializer
        # output. Our serializers do not expose such a field, so this currently results
        # in no Location header being added.
        #
        # Be careful not to introduce a field named `url` with a different semantic
        # (e.g. an external job posting URL), as DRF would then incorrectly use it to
        # populate the Location header.
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

        # opportunity_key is computed only on create and is not recomputed on updates.
        # Therefore, a uniqueness conflict should not occur during updates and we do
        # not handle IntegrityError here.
        instance = serializer.save()

        # Re-fetch with annotated queryset for consistent response shape
        instance = self._annotated_queryset().get(pk=instance.pk)

        response_serializer = JobOpportunityDetailSerializer(
            instance,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
