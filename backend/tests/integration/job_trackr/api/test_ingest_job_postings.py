# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/test_ingest_job_postings.py

import pytest
from apps.ingestion.models import IngestedJobPosting, IngestionSource, IngestionStatus

EMAIL_SOURCE = IngestionSource.EMAIL.value


@pytest.mark.django_db
def test_ingest_job_postings_creates_records(api_client):
    payload = [
        {
            "title": "Backend Engineer",
            "company": "ACME Corp",
            "raw_url": "https://indeed.com/viewjob?jk=123",
            "platform": "indeed",
            "ingestion_source": EMAIL_SOURCE,
        }
    ]

    response = api_client.post(
        "/api/v1/ingest/job-postings/",
        payload,
        format="json",
    )

    assert response.status_code == 201, response.json()
    assert IngestedJobPosting.objects.count() == 1

    job = IngestedJobPosting.objects.first()
    assert job is not None
    assert job.title == "Backend Engineer"
    assert job.company == "ACME Corp"
    assert job.platform == "indeed"
    assert job.status == IngestionStatus.RECEIVED


@pytest.mark.django_db
def test_ingest_job_postings_is_idempotent(api_client):
    payload = [
        {
            "title": "Backend Engineer",
            "company": "ACME Corp",
            "raw_url": "https://linkedin.com/viewjob?jk=123",
            "platform": "linkedin",
            "ingestion_source": EMAIL_SOURCE,
        }
    ]

    url = "/api/v1/ingest/job-postings/"

    response1 = api_client.post(url, payload, format="json")
    response2 = api_client.post(url, payload, format="json")

    assert response1.status_code == 201, response1.json()
    assert response2.status_code == 201, response2.json()

    assert IngestedJobPosting.objects.count() == 1


@pytest.mark.django_db
def test_ingest_job_postings_partial_duplicate(api_client):
    url = "/api/v1/ingest/job-postings/"

    existing_job = [
        {
            "title": "Backend Engineer",
            "company": "ACME Corp",
            "raw_url": "https://indeed.com/viewjob?jk=123",
            "platform": "indeed",
            "ingestion_source": EMAIL_SOURCE,
        }
    ]

    new_job = [
        {
            "title": "Python Developer",
            "company": "Globex",
            "raw_url": "https://indeed.com/viewjob?jk=456",
            "platform": "indeed",
            "ingestion_source": EMAIL_SOURCE,
        }
    ]

    # First ingestion
    api_client.post(url, existing_job, format="json")

    # Mixed ingestion (1 duplicate + 1 new)
    response = api_client.post(
        url,
        existing_job + new_job,
        format="json",
    )

    assert response.status_code == 201, response.json()
    assert IngestedJobPosting.objects.count() == 2


@pytest.mark.django_db
def test_ingest_job_postings_validation_error(api_client):
    payload = [
        {
            # Missing required field: "title"
            "company": "ACME Corp",
            "raw_url": "https://indeed.com/viewjob?jk=123",
            "platform": "indeed",
            "ingestion_source": EMAIL_SOURCE,
        }
    ]

    response = api_client.post(
        "/api/v1/ingest/job-postings/",
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert IngestedJobPosting.objects.count() == 0
