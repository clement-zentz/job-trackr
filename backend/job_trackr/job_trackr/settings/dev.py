# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/dev.py

import environ
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403,F401

env = environ.Env(
    DJANGO_SECRET_KEY=(
        str,
        "django-insecure-dev-only-change-me",
    ),
    ALLOWED_HOSTS=(
        list,
        ["localhost", "127.0.0.1", "backend"],
    ),
    DATABASE_URL=(
        str,
        "postgres://dev_user:dev_password@database:5432/dev_database",
    ),
)

DEBUG = True

SECRET_KEY = env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must contain at least one host")

DATABASES = {
    "default": env.db("DATABASE_URL"),
}
