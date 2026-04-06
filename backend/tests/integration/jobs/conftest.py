# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/jobs/conftest.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user():
    User = get_user_model()
    return User.objects.create_user(  # type: ignore[attr-defined]
        username="testuser",
        password="testpass123",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
