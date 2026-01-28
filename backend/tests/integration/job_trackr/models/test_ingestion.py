# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/models/test_ingestion.py

import pytest
from apps.ingestion.models import IngestedJobPosting, IngestionStatus


@pytest.mark.django_db
def test_create_ingested_job_posting():
    ingested = IngestedJobPosting.objects.create(
        source="email",
        title="DevOps Engineer",
        company="Infra Corp",
        platform="email",
        raw_url="https://example.com/job/789",
        fingerprint="abc123fingerprint",
    )

    assert ingested.id is not None
    assert ingested.status == IngestionStatus.RECEIVED
    assert ingested.ingested_at is not None
