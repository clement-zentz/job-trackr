# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/test_ingest_job_postings.py

from typing import cast

import pytest
from apps.ingestion.models import IngestedJobPosting, IngestionSource, IngestionStatus
from rest_framework.response import Response
from rest_framework.test import APIClient

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

    response: Response = api_client.post(
        "/api/v1/ingest/job-postings/",
        payload,
        format="json",
    )

    data = response.json()
    assert data == {"received": 1, "created": 1, "duplicates": 0}

    assert response.status_code == 201, data
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

    response1: Response = api_client.post(url, payload, format="json")
    response2: Response = api_client.post(url, payload, format="json")

    data1 = response1.json()
    assert data1 == {"received": 1, "created": 1, "duplicates": 0}

    data2 = response2.json()
    assert data2 == {"received": 1, "created": 0, "duplicates": 1}

    assert response1.status_code == 201, data1
    assert response2.status_code == 201, data2

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
    response: Response = api_client.post(
        url,
        existing_job + new_job,
        format="json",
    )

    data = response.json()
    assert data == {"received": 2, "created": 1, "duplicates": 1}

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

    response: Response = api_client.post(
        "/api/v1/ingest/job-postings/",
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert IngestedJobPosting.objects.count() == 0


@pytest.mark.django_db
def test_ingest_job_postings_requires_api_key():
    client = APIClient()  # no default headers

    # NOTE:
    # DRF's APIClient typing is incomplete and may infer WSGIRequest/Unknown.
    # At runtime, APIClient.post() always returns a Response with status_code.
    response = cast(
        Response,
        client.post(
            "/api/v1/ingest/job-postings/",
            [],
            format="json",
        ),
    )
    # NOTE:
    # Although AuthenticationFailed can map to 401, this view also uses
    # IsAuthenticated. Unauthenticated requests are ultimately rejected at the
    # permission layer, which returns HTTP 403.
    assert response.status_code == 403


@pytest.mark.django_db
def test_ingest_job_postings_rejects_invalid_api_key(api_client):
    api_client.defaults["HTTP_X_INGESTION_API_KEY"] = "wrong-key"

    response: Response = api_client.post(
        "/api/v1/ingest/job-postings/",
        [],
        format="json",
    )
    # Rejected by IsAuthenticated, which returns 403 for unauthenticated requests
    assert response.status_code == 403
