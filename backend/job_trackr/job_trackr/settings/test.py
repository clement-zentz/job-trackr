# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/test.py

from .base import *  # noqa: F403,F401

SECRET_KEY = "django-insecure-test-key"

# Use SQLite for tests (fast, zero-config)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Speed up tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]


# Disable migrations for faster test DB setup
class DisableMigrations(dict):
    def __contains__(self, item) -> bool:
        return True

    def __getitem__(self, item):
        return None


MIGRATION_MODULES = DisableMigrations()
