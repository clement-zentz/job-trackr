# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/mypy.py

from .base import *

SECRET_KEY = "mypy"
DEBUG = False

ALLOWED_HOSTS = ["*"]

# Use lightweight settings for type checking.
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
