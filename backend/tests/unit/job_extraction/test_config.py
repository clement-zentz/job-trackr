# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/test_config.py

import pytest
from pydantic_core import ValidationError

from job_extraction.config import get_settings


def test_settings_loaded_from_env(monkeypatch):
    monkeypatch.setenv("EMAIL_ADDRESS", "test@example.com")
    monkeypatch.setenv("EMAIL_PASSWORD", "secret")
    monkeypatch.setenv("FIXTURE_DIR", "/tmp/fixtures")
    monkeypatch.setenv("SAMPLE_DIR", "/tmp/samples")
    monkeypatch.setenv("USER_FIRST_NAME", "Test")
    monkeypatch.setenv("USER_LAST_NAME", "User")

    settings = get_settings()

    assert settings.EMAIL_ADDRESS == "test@example.com"
    assert settings.EMAIL_PASSWORD == "secret"
    assert settings.USER_FIRST_NAME == "Test"
    assert settings.USER_LAST_NAME == "User"


def test_settings_fail_without_email_credentials(monkeypatch):
    monkeypatch.delenv("EMAIL_ADDRESS", raising=False)
    monkeypatch.delenv("EMAIL_PASSWORD", raising=False)

    get_settings.cache_clear()

    with pytest.raises(ValidationError):
        get_settings(_env_file=None)
