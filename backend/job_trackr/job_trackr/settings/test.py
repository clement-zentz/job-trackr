# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/test.py

import environ

from .base import *  # noqa: F403,F401

env = environ.Env(
    DATABASE_URL=(
        str,
        "postgres://test_user:test_password@127.0.0.1:5433/test_database",
    ),
)

SECRET_KEY = "django-insecure-test-key"

DATABASES = {
    "default": env.db("DATABASE_URL"),
}

# Speed up tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# --- Django-Allauth registration tests ---
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# --- Django-Allauth headless frontend URLs (required for email verification flows) ---
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "http://testserver/verify-email/{key}",
    "account_reset_password": "http://testserver/forgot-password",
    "account_reset_password_from_key": "http://testserver/reset-password/{key}",
    "account_signup": "http://testserver/register",
}
