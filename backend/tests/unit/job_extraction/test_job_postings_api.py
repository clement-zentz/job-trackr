# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_extraction/test_job_postings_api.py

from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from job_extraction.config import Settings, get_settings
from job_extraction.main import app
from job_extraction.schemas.extracted_jobs import JobPostingResponse


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def clear_overrides():
    app.dependency_overrides = {}
    yield
    app.dependency_overrides = {}


def test_ingest_returns_422_without_email_credentials(client):
    settings = Settings(
        INGESTION_API_KEY="test-key",
        EMAIL_ADDRESS=None,
        EMAIL_PASSWORD=None,
    )

    app.dependency_overrides[get_settings] = lambda: settings

    response = client.post("/job-postings")

    assert response.status_code == 422
    assert (
        response.json()["detail"] == "EMAIL_ADDRESS and EMAIL_PASSWORD must be provided"
    )


def test_ingest_success(client, mocker):
    fake_jobs = [
        JobPostingResponse(
            title="Backend Engineer",
            company="Backend Corp",
            location="Paris",
            raw_url="https://example-url.com/job123",
            platform="indeed",
            ingestion_source="email",
        )
    ]

    settings = Settings(
        INGESTION_API_KEY="test-key",
        EMAIL_ADDRESS="test@example.com",
        EMAIL_PASSWORD="secret",
    )

    app.dependency_overrides[get_settings] = lambda: settings

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        new=AsyncMock(return_value=fake_jobs),
    )

    ingest_mock = AsyncMock(return_value=None)
    mocker.patch(
        "job_extraction.services.django_client.DjangoIngestionClient.ingest_job_postings",
        new=ingest_mock,
    )

    response = client.post("/job-postings")

    assert response.status_code == 200
    body = response.json()

    assert body["total"] == 1

    job1 = body["jobs"][0]

    assert job1["title"] == "Backend Engineer"
    assert job1["company"] == "Backend Corp"
    assert job1["platform"] == "indeed"
    assert job1["ingestion_source"] == "email"

    ingest_mock.assert_called_once_with(fake_jobs)


def test_django_client_called_with_correct_settings(client, mocker):
    settings = Settings(
        INGESTION_API_KEY="my-api-key",
        JOB_TRACKR_URL="http://custom-url:8000",
        EMAIL_ADDRESS="a",
        EMAIL_PASSWORD="b",
    )

    app.dependency_overrides[get_settings] = lambda: settings

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        new=AsyncMock(return_value=[]),
    )

    client_constructor_mock = mocker.patch(
        "job_extraction.api.job_postings.DjangoIngestionClient"
    )
    client_constructor_mock.return_value.ingest_job_postings = AsyncMock()

    response = client.post("/job-postings")
    assert response.status_code == 200

    client_constructor_mock.assert_called_once_with(
        base_url="http://custom-url:8000",
        api_key="my-api-key",
    )


def test_ingest_service_failure_returns_500(client, mocker):
    settings = Settings(
        INGESTION_API_KEY="test",
        EMAIL_ADDRESS="a",
        EMAIL_PASSWORD="b",
    )

    app.dependency_overrides[get_settings] = lambda: settings

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        new=AsyncMock(side_effect=RuntimeError("IMAP failure")),
    )

    response = client.post("/job-postings")

    assert response.status_code == 500


def test_django_client_failure_returns_500(client, mocker):
    settings = Settings(
        INGESTION_API_KEY="test",
        EMAIL_ADDRESS="a",
        EMAIL_PASSWORD="b",
    )

    app.dependency_overrides[get_settings] = lambda: settings

    mocker.patch(
        "job_extraction.email_ingestion.JobIngestionService.ingest_from_email",
        new=AsyncMock(return_value=[]),
    )

    mocker.patch(
        "job_extraction.services.django_client.DjangoIngestionClient.ingest_job_postings",
        new=AsyncMock(side_effect=RuntimeError("Django down")),
    )

    response = client.post("/job-postings")

    assert response.status_code == 500
