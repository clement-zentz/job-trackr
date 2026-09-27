# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/dev.py

import environ

from .base import *  # noqa: F403,F401

DEBUG = True

SECRET_KEY = "django-insecure-key-dev-only"

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",
]

DATABASE_URL = "postgres://dev_user:dev_password@database:5432/dev_database"

DATABASES = {
    "default": environ.Env.db_url_config(DATABASE_URL),
}

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# --- Django-Allauth registration ---
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "http://localhost:5173/verify-email/{key}",
    "account_reset_password": "http://localhost:5173/forgot-password",
    "account_reset_password_from_key": "http://localhost:5173/reset-password/{key}",
    "account_signup": "http://localhost:5173/register",
}

HEADLESS_SERVE_SPECIFICATION = True
