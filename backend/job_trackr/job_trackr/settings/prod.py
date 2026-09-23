# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/prod.py

import re

import environ
from django.conf import global_settings
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403,F401
from .base import MIDDLEWARE as BASE_MIDDLEWARE

env = environ.Env()

DEBUG = False

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

MIDDLEWARE = [
    BASE_MIDDLEWARE[0],
    "whitenoise.middleware.WhiteNoiseMiddleware",
    *BASE_MIDDLEWARE[1:],
]

STORAGES = {
    **global_settings.STORAGES,
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

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

ADMIN_URL = env.str("DJANGO_ADMIN_URL").strip().strip("/")

if not ADMIN_URL:
    raise ImproperlyConfigured("DJANGO_ADMIN_URL must not be empty")

if not re.fullmatch(r"[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*", ADMIN_URL):
    raise ImproperlyConfigured(
        "DJANGO_ADMIN_URL must contain only letters, numbers, hyphens, "
        "underscores, and path separators"
    )

ADMIN_URL = f"{ADMIN_URL}/"

# --- Django-Allauth security ---
ALLAUTH_TRUSTED_CLIENT_IP_HEADER = "X-Real-IP"
