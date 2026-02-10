# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/conftest.py

import pytest

from job_extraction.config import get_settings


@pytest.fixture(autouse=True)
def clear_settings_cache():
    """
    Ensure unit tests do NOT load values from .env files.
    Tests must rely only on explicitly set environment variables.
    """
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
