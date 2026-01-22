# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/test_config.py


def test_settings_loaded_from_env(monkeypatch):
    monkeypatch.setenv("EMAIL_ADDRESS", "test@example.com")
    monkeypatch.setenv("EMAIL_PASSWORD", "secret")
    monkeypatch.setenv("FIXTURE_DIR", "/tmp/fixtures")
    monkeypatch.setenv("SAMPLE_DIR", "/tmp/samples")
    monkeypatch.setenv("USER_FIRST_NAME", "Test")
    monkeypatch.setenv("USER_LAST_NAME", "User")

    from job_extraction.config import get_settings

    settings = get_settings()

    assert settings.email_address == "test@example.com"
    assert settings.email_password == "secret"
