# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/test_job_postings_api.py

from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from job_extraction.email_ingestion import JobIngestionService
from job_extraction.main import app


@pytest.mark.asyncio
async def test_ingestion_returns_jobs(mocker):
    fake_jobs = [
        {
            "title": "Backend Engineer",
            "company": "Backend Corp",
            "location": "UK",
            "raw_url": "https://example-url.com/job123",
            "platform": "linkedin",
            "ingestion_source": "email",
        }
    ]

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        return_value=fake_jobs,
    )

    service = JobIngestionService()
    jobs = await service.ingest_from_email("a", "b")

    assert len(jobs) == 1


def test_ingest_success(monkeypatch, mocker):
    monkeypatch.setenv("EMAIL_ADDRESS", "test@example.com")
    monkeypatch.setenv("EMAIL_PASSWORD", "secret")
    # Required non-email settings
    monkeypatch.setenv("FIXTURE_DIR", "/tmp/fixtures")
    monkeypatch.setenv("SAMPLE_DIR", "/tmp/samples")
    monkeypatch.setenv("USER_FIRST_NAME", "Test")
    monkeypatch.setenv("USER_LAST_NAME", "User")

    fake_jobs = [
        {
            "title": "Backend Engineer",
            "company": "Backend Corp",
            "location": "Paris",
            "raw_url": "https://example-url.com/job123",
            "platform": "indeed",
            "ingestion_source": "email",
        }
    ]

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        return_value=fake_jobs,
    )

    ingest_mock = AsyncMock(return_value=None)
    mocker.patch(
        "job_extraction.services.django_client.DjangoIngestionClient.ingest_job_postings",
        new=ingest_mock,
    )

    client = TestClient(app)
    response = client.post("/job-postings")
    assert response.request.url.path == "/job-postings"

    assert response.status_code == 200
    assert response.json()["total"] == 1

    ingest_mock.assert_called_once()
    args, kwargs = ingest_mock.call_args
    assert args[0] == fake_jobs
