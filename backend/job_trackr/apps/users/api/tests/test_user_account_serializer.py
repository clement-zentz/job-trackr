# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/tests/test_user_account_serializer.py

import pytest
from rest_framework import serializers

from apps.users.api.serializers import USERNAME_ALREADY_EXISTS, UserAccountSerializer
from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return UserFactory(username="testuser")


def test_update_translates_username_integrity_error_to_validation_error(
    user,
):
    UserFactory(username="existinguser")

    serializer = UserAccountSerializer(instance=user)

    with pytest.raises(serializers.ValidationError) as exc_info:
        serializer.update(
            user,
            {
                "username": "ExistingUser",
            },
        )

    assert exc_info.value.detail == {"username": USERNAME_ALREADY_EXISTS}

    user.refresh_from_db()

    assert user.username == "testuser"


def test_update_does_not_overwrite_concurrent_password_change(user):
    serializer = UserAccountSerializer(
        instance=user,
        data={"first_name": "Updated"},
        partial=True,
    )
    serializer.is_valid(raise_exception=True)

    concurrently_updated_user = type(user).objects.get(pk=user.pk)
    concurrently_updated_user.set_password("new-password")
    concurrently_updated_user.save(update_fields=["password"])

    expected_password_hash = concurrently_updated_user.password

    serializer.save()

    user.refresh_from_db()

    assert user.first_name == "Updated"
    assert user.password == expected_password_hash
