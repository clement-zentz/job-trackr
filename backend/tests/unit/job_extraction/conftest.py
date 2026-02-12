# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/conftest.py

import pytest

from job_extraction.config import _build_settings


@pytest.fixture(autouse=True)
def clear_settings_cache():
    """
    Clear the _build_settings() cache before and after each test so that
    configuration is reloaded for every test run.

    Tests are expected to rely on explicitly set environment variables
    rather than cached settings.
    """
    # Clear cache before test
    _build_settings.cache_clear()
    yield
    # Clear cache after test
    _build_settings.cache_clear()
