# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/tests/test_prod_settings.py

import importlib
import sys

import pytest
from django.core.exceptions import ImproperlyConfigured

PROD_SETTINGS_MODULE = "job_trackr.settings.prod"


@pytest.fixture
def load_prod_settings(monkeypatch):
    prod_env = {
        "DJANGO_SECRET_KEY": "test-secret-key",
        "ALLOWED_HOSTS": "example.com",
        "DATABASE_URL": "postgres://user:password@localhost:5432/job_trackr",
        "EMAIL_HOST": "smtp.example.com",
        "EMAIL_HOST_USER": "user",
        "EMAIL_HOST_PASSWORD": "password",
        "DEFAULT_FROM_EMAIL": "noreply@example.com",
        "FRONTEND_URL": "https://example.com",
    }

    for key, value in prod_env.items():
        monkeypatch.setenv(key, value)

    def load(admin_url: str):
        monkeypatch.setenv("DJANGO_ADMIN_URL", admin_url)
        sys.modules.pop(PROD_SETTINGS_MODULE, None)

        return importlib.import_module(PROD_SETTINGS_MODULE)

    yield load

    sys.modules.pop(PROD_SETTINGS_MODULE, None)


@pytest.mark.parametrize(
    "admin_url",
    [
        "api",
        "api/admin",
        "accounts",
        "accounts/admin",
    ],
)
def test_admin_url_rejects_reserved_prefixes(load_prod_settings, admin_url):
    with pytest.raises(ImproperlyConfigured, match="reserved URL prefix"):
        load_prod_settings(admin_url)


@pytest.mark.parametrize(
    ("admin_url", "expected"),
    [
        ("private-admin", "private-admin/"),
        ("internal/admin", "internal/admin/"),
        (" /private-admin/ ", "private-admin/"),
    ],
)
def test_admin_url_accepts_non_reserved_paths(
    load_prod_settings,
    admin_url,
    expected,
):
    settings = load_prod_settings(admin_url)

    assert expected == settings.ADMIN_URL


@pytest.mark.parametrize(
    "admin_url",
    [
        "<path:rest>",
        "admin/<slug:name>",
        "../admin",
        "admin//private",
        "admin?foo=bar",
    ],
)
def test_admin_url_rejects_invalid_path_syntax(load_prod_settings, admin_url):
    with pytest.raises(
        ImproperlyConfigured,
        match="must contain only letters, numbers, hyphens",
    ):
        load_prod_settings(admin_url)


@pytest.mark.parametrize(
    "admin_url",
    [
        "",
        "   ",
        "/",
        "///",
    ],
)
def test_admin_url_rejects_empty_normalized_paths(
    load_prod_settings,
    admin_url,
):
    with pytest.raises(
        ImproperlyConfigured,
        match="DJANGO_ADMIN_URL must not be empty",
    ):
        load_prod_settings(admin_url)
