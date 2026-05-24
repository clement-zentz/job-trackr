# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/test.py

import environ

from .base import *  # noqa: F403,F401

env = environ.Env(
    DATABASE_URL=(
        str,
        "postgres://test_user:test_password@localhost:5433/test_database",
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
