# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/serializers.py

from typing import cast

from django.db import IntegrityError, transaction
from rest_framework import serializers

from apps.users.models import User

USERNAME_ALREADY_EXISTS = "A user with that username already exists."


class UserAccountSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "email",
            "date_joined",
        ]

    def update(
        self,
        instance: User,
        validated_data: dict[str, object],
    ) -> User:
        update_fields = set(validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            with transaction.atomic():
                instance.save(update_fields=update_fields)
        except IntegrityError as exc:
            username = validated_data.get("username")

            if isinstance(username, str):
                normalized_username = username.lower()

                if (
                    User.objects.filter(username=normalized_username)
                    .exclude(pk=instance.pk)
                    .exists()
                ):
                    raise serializers.ValidationError(
                        {"username": USERNAME_ALREADY_EXISTS}
                    ) from exc

            raise

        return instance

    def validate_username(self, value: str) -> str:
        value = value.lower()

        username_field = cast(
            serializers.CharField,
            self.fields["username"],
        )
        max_length = username_field.max_length

        if max_length is not None and len(value) > max_length:
            raise serializers.ValidationError(
                username_field.error_messages["max_length"].format(
                    max_length=max_length
                ),
                code="max_length",
            )

        users = User.objects.filter(username=value)

        if isinstance(self.instance, User):
            users = users.exclude(pk=self.instance.pk)

        if users.exists():
            raise serializers.ValidationError(USERNAME_ALREADY_EXISTS)

        return value
