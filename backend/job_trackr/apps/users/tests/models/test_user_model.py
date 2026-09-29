# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/models/test_user_model.py

import pytest

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
