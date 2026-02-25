# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/commands/test_process_ingested_jobs_command.py

from unittest.mock import patch

import pytest
from apps.ingestion.models import IngestedJobPosting, IngestionStatus
from django.core.management import call_command


@pytest.mark.django_db
def test_command_marks_failed_on_exception():
    ing = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        raw_url="https://example.com/job1",
        fingerprint="e" * 64,
        status=IngestionStatus.RECEIVED,
    )

    with patch(
        "apps.ingestion.services.ingestion_processor.IngestionProcessor.process",
        side_effect=Exception("Boom"),
    ):
        call_command("process_jobs")

        ing.refresh_from_db()

        assert ing.status == IngestionStatus.FAILED
        assert "Boom" in ing.error_message
