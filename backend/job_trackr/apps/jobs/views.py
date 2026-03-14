# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/views.py

from typing import Any

from django.db import IntegrityError
from django.db.models import Count, Max, Prefetch, QuerySet
from rest_framework import serializers, status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.reverse import reverse

from apps.jobs.models import JobOpportunity, JobPosting
from apps.jobs.serializers import (
    JobOpportunityReadSerializer,
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

        if self.action == "retrieve":
            qs = qs.prefetch_related(
                Prefetch(
                    "job_postings",
                    queryset=JobPosting.objects.order_by("-posted_at"),
                )
            )

        return qs

    def get_queryset(self) -> QuerySet[JobOpportunity]:
        queryset = JobOpportunity.objects.filter(is_active=True)

        if self.action in ("list", "retrieve"):
            queryset = self._annotated_queryset()

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

        # Re-fetch with annotated queryset for consistent response shape
        instance = self._annotated_queryset().get(pk=instance.pk)

        response_serializer = JobOpportunityReadSerializer(instance)

        # Manually compute the Location header because the serializer includes a
        # `url` field for the external job posting. DRF's default `get_success_headers`
        # would treat this field as the resource URL.
        headers = {
            "Location": reverse(
                "job-opportunity-detail",
                args=[instance.pk],
                request=request,
            )
        }

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

        response_serializer = JobOpportunityReadSerializer(instance)

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
