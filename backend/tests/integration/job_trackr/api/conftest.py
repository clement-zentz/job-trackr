# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/conftest.py

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()
