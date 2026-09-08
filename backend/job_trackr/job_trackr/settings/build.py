# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/settings/build.py

from django.conf import global_settings

from .base import *  # noqa: F403,F401

DEBUG = False

STORAGES = {
    **global_settings.STORAGES,
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
