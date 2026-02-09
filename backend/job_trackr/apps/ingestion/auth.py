# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/auth.py

from __future__ import annotations

import secrets
from dataclasses import dataclass

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from rest_framework import authentication, exceptions


@dataclass(frozen=True)
class ServiceUser:
    """
    Lightweight "user" object for service-to-service auth.
    """

    username = "fastapi-ingestion-service"

    @property
    def is_authenticated(self) -> bool:
        return True


class IngestionApiKeyAuthentication(authentication.BaseAuthentication):
    """
    Authenticate FastAPI -> Django requests using a shared API key.

    Client sends: X-Ingestion-Api-Key: <secret>
    """

    header_name = "HTTP_X_INGESTION_API_KEY"

    def authenticate(self, request):
        expected = getattr(settings, "INGESTION_API_KEY", None)
        if not expected:
            # Server misconfiguration: fail fast at startup rather than returning
            # misleading authentication errors (401/403) at request time.
            raise ImproperlyConfigured(
                "INGESTION_API_KEY must be set to enable ingestion authentication"
            )

        provided = request.META.get(self.header_name)
        if not provided:
            raise exceptions.AuthenticationFailed("Missing X-Ingestion-Api-Key header")

        # Constant-time comparison to avoid timing side-channels
        if not secrets.compare_digest(str(provided), str(expected)):
            raise exceptions.AuthenticationFailed("Invalid API key")

        return ServiceUser(), None
