# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/api/base_viewsets.py

from typing import Any, TypeVar, cast

from django.db.models import Model
from rest_framework import serializers, status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

ModelT = TypeVar("ModelT", bound=Model)


class ReadAfterWriteModelViewSet(viewsets.ModelViewSet[ModelT]):
    """
    ModelViewSet using:

    - a dedicated serializer for list actions;
    - a dedicated serializer for write actions;
    - serializer_class for detail and write responses.

    Create and update responses are serialized again using serializer_class.
    """

    list_serializer_class: type[serializers.BaseSerializer[Any]]
    write_serializer_class: type[serializers.BaseSerializer[Any]]

    write_actions = frozenset(
        {
            "create",
            "update",
            "partial_update",
        }
    )

    def get_serializer_class(
        self,
    ) -> type[serializers.BaseSerializer[Any]]:
        action = getattr(self, "action", None)

        if action == "list":
            return self.list_serializer_class

        if action in self.write_actions:
            return self.write_serializer_class

        return super().get_serializer_class()

    def _serialize_detail_response(
        self,
        instance: ModelT,
    ) -> serializers.BaseSerializer[Any]:
        """
        Re-fetch the object using the enriched queryset and serialize it
        using the default detail serializer.
        """
        instance = self.get_queryset().get(pk=instance.pk)

        detail_serializer_class = super().get_serializer_class()

        return detail_serializer_class(
            instance,
            context=self.get_serializer_context(),
        )

    def create(
        self,
        request: Request,
        *args: Any,
        **kwargs: Any,
    ) -> Response:
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)

        self.perform_create(write_serializer)

        instance = cast(ModelT, write_serializer.instance)
        read_serializer = self._serialize_detail_response(instance)

        return Response(
            read_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def update(
        self,
        request: Request,
        *args: Any,
        **kwargs: Any,
    ) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        write_serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )
        write_serializer.is_valid(raise_exception=True)

        self.perform_update(write_serializer)

        updated_instance = cast(ModelT, write_serializer.instance)
        read_serializer = self._serialize_detail_response(updated_instance)

        return Response(read_serializer.data)
