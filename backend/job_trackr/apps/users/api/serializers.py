# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/serializers.py

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
        try:
            with transaction.atomic():
                return super().update(instance, validated_data)
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

    def validate_username(self, value: str) -> str:
        value = value.lower()

        users = User.objects.filter(username=value)

        if isinstance(self.instance, User):
            users = users.exclude(pk=self.instance.pk)

        if users.exists():
            raise serializers.ValidationError(USERNAME_ALREADY_EXISTS)

        return value
