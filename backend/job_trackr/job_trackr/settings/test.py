# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/test.py

import os

from .base import *  # noqa: F403,F401

SECRET_KEY = "django-insecure-test-key"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_TEST_DB", "test_database"),
        "USER": os.getenv("POSTGRES_TEST_USER", "test_user"),
        "PASSWORD": os.getenv("POSTGRES_TEST_PASSWORD", "test_password"),
        "HOST": os.getenv("POSTGRES_TEST_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_TEST_PORT", "5433"),
    }
}

# Speed up tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]
