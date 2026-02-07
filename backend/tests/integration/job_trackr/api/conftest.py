# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/conftest.py

import pytest
from django.test import override_settings
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    client = APIClient()
    # Add the ingestion API key header to all requests
    client.defaults["HTTP_X_INGESTION_API_KEY"] = "test-api-key"
    return client


@pytest.fixture
def django_db_setup(django_db_setup, django_db_blocker):
    """Override Django settings for tests."""
    with (
        django_db_blocker.unblock(),
        override_settings(INGESTION_API_KEY="test-api-key"),
    ):
        yield
