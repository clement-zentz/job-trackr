# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/prod.py

import environ
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403,F401

env = environ.Env()

DEBUG = False

SECRET_KEY = env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must contain at least one host")

DATABASES = {
    "default": env.db("DATABASE_URL"),
}

# --- Email settings ---
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = env("EMAIL_HOST")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")

# --- Django-Allauth registration ---
FRONTEND_URL = env("FRONTEND_URL")

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": f"{FRONTEND_URL}/verify-email/{{key}}",
    "account_reset_password": f"{FRONTEND_URL}/forgot-password",
    "account_reset_password_from_key": f"{FRONTEND_URL}/reset-password/{{key}}",
    "account_signup": f"{FRONTEND_URL}/register",
}
