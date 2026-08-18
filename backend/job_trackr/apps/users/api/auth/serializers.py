# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/auth/serializers.py

from rest_framework import serializers

from apps.users.models import User


class LoginSerializer(serializers.Serializer[dict[str, str]]):
    username = serializers.CharField()
    password = serializers.CharField(
        trim_whitespace=False,
        write_only=True,
    )


class UserReadSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
        ]
        read_only_fields = tuple(fields)
