# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/management/commands/ingest_jobs.py

from typing import Any

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from requests.exceptions import RequestException


class Command(BaseCommand):
    help = "Trigger job ingestion via FastAPI"

    def handle(self, *args: Any, **options: Any):
        base_url: str = settings.JOB_EXTRACTION_BASE_URL

        try:
            response = requests.post(
                f"{base_url.rstrip('/')}/job-postings",
                timeout=60,
            )
            response.raise_for_status()
        except RequestException as exc:
            raise CommandError(f"Failed to trigger job ingestion: {exc}") from exc

        self.stdout.write(self.style.SUCCESS("Job ingestion triggered successfully"))
