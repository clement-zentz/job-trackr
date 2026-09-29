# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/serializers.py

from rest_framework import serializers

from apps.users.models import User


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

    def validate_username(self, value: str) -> str:
        users = User.objects.filter(username__iexact=value)

        if isinstance(self.instance, User):
            users = users.exclude(pk=self.instance.pk)

        if users.exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )

        return value
