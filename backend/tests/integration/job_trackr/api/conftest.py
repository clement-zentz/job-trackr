# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/conftest.py

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    client = APIClient()
    # Add the ingestion API key header to all requests
    client.defaults["HTTP_X_INGESTION_API_KEY"] = "test-api-key"
    return client


@pytest.fixture(autouse=True)
def ingestion_api_key_settings(settings):
    """
    Ensure the ingestion API key is configured for all integration tests.
    """
    settings.INGESTION_API_KEY = "test-api-key"
