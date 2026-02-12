# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/test_config.py

import pytest
from pydantic_core import ValidationError

from job_extraction.config import _build_settings


def test_settings_requires_ingestion_api_key(monkeypatch):
    monkeypatch.delenv("INGESTION_API_KEY", raising=False)

    with pytest.raises(ValidationError) as exc:
        _build_settings(_env_file=None)

    error_fields = {e["loc"][0] for e in exc.value.errors()}
    assert "INGESTION_API_KEY" in error_fields


def test_settings_loads_required_and_optional_fields(monkeypatch):
    monkeypatch.setenv("INGESTION_API_KEY", "test-key")
    monkeypatch.setenv("EMAIL_ADDRESS", "test@example.com")
    monkeypatch.setenv("EMAIL_PASSWORD", "secret")
    monkeypatch.setenv("FIXTURE_DIR", "/tmp/fixtures")
    monkeypatch.setenv("SAMPLE_DIR", "/tmp/samples")
    monkeypatch.setenv("USER_FIRST_NAME", "Test")
    monkeypatch.setenv("USER_LAST_NAME", "User")

    settings = _build_settings(_env_file=None)

    assert settings.INGESTION_API_KEY == "test-key"
    assert settings.EMAIL_ADDRESS == "test@example.com"
    assert settings.EMAIL_PASSWORD == "secret"
    assert settings.USER_FIRST_NAME == "Test"
    assert settings.USER_LAST_NAME == "User"


def test_settings_default_values(monkeypatch):
    monkeypatch.setenv("INGESTION_API_KEY", "test-key")

    settings = _build_settings(_env_file=None)

    assert settings.DEBUG is False
    assert settings.JOB_TRACKR_URL == "http://job-trackr:8000"
    assert settings.EMAIL_ADDRESS is None
    assert settings.FIXTURE_DIR is None


def test_deprecated_lowercase_accessor(monkeypatch):
    monkeypatch.setenv("INGESTION_API_KEY", "test-key")

    settings = _build_settings(_env_file=None)

    with pytest.warns(DeprecationWarning):
        _ = settings.debug


def test_env_case_insensitive_loading(monkeypatch):
    monkeypatch.setenv("ingestion_api_key", "test-key")

    settings = _build_settings(_env_file=None)

    assert settings.INGESTION_API_KEY == "test-key"
