# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/models/test_user_model.py

import pytest
from django.core.exceptions import ValidationError

from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


def test_user_save_normalizes_username_to_lowercase():
    user = UserFactory(username="MixedCaseUser")

    user.refresh_from_db()

    assert user.username == "mixedcaseuser"


def test_user_save_normalizes_updated_username_to_lowercase():
    user = UserFactory(username="testuser")

    user.username = "UpdatedUser"
    user.save()
    user.refresh_from_db()

    assert user.username == "updateduser"


def test_user_full_clean_rejects_duplicate_username_after_lowercasing():
    UserFactory(username="alice")
    user = UserFactory.build(username="ALICE")

    with pytest.raises(ValidationError) as exc_info:
        user.full_clean()

    assert "username" in exc_info.value.message_dict


def test_user_full_clean_rejects_username_invalid_after_lowercasing():
    user = UserFactory.build(username="İpek")

    with pytest.raises(ValidationError) as exc_info:
        user.full_clean()

    assert "username" in exc_info.value.message_dict
