# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/jobs/postings/test_postings_api.py

import pytest
from apps.jobs.postings.models import JobPosting
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


@pytest.fixture
def job_posting():
    return JobPosting.objects.create(
        title="Backend Engineer",
        company="Stripe",
        platform="linkedin",
        raw_url="https://example.com/job/1",
        canonical_url="https://example.com/job/1",
        job_key="job-1",
        location="Paris",
    )


def test_list_postings(authenticated_client, job_posting):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert any(item["id"] == str(job_posting.id) for item in response.data)


def test_retrieve_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == str(job_posting.id)


def test_create_posting(authenticated_client):
    url = reverse("job-posting-list")

    payload = {
        "title": "Frontend Engineer",
        "company": "Google",
        "platform": "linkedin",
        "raw_url": "https://example.com/job/2",
        "canonical_url": "https://example.com/job/2",
        "job_key": "job-2",
        "location": "Lyon",
    }

    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert JobPosting.objects.filter(title="Frontend Engineer").exists()
    assert response.data["title"] == "Frontend Engineer"


def test_partial_update_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    payload = {
        "title": "Senior Backend Engineer",
    }

    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    job_posting.refresh_from_db()
    assert job_posting.title == "Senior Backend Engineer"


def test_full_update_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    payload = {
        "title": "Full Stack Engineer",
        "company": "Amazon",
        "platform": "indeed",
        "raw_url": "https://example.com/job/3",
        "canonical_url": "https://example.com/job/3",
        "job_key": "job-3",
        "location": "Lille",
    }

    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    job_posting.refresh_from_db()
    assert job_posting.title == "Full Stack Engineer"
    assert job_posting.company == "Amazon"


def test_delete_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    response = authenticated_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not (JobPosting.objects.filter(title="Backend Engineer").exists())


def test_authentication_required(api_client):
    url = reverse("job-posting-list")

    response = api_client.get(url)

    assert response.status_code == 403


def test_session_authentication(api_client, user):
    """
    Ensure SessionAuthentication works with a Django session.
    """
    api_client.force_login(user)

    url = reverse("job-posting-list")

    response = api_client.get(url)

    assert response.status_code == 200


def test_create_duplicate_posting_returns_409(authenticated_client):
    url = reverse("job-posting-list")

    payload = {
        "title": "Backend Engineer",
        "company": "Stripe",
        "platform": "linkedin",
        "raw_url": "https://example.com/job/1",
        "canonical_url": "https://example.com/job/1",
        "job_key": "job-1",
        "location": "Paris",
    }

    # First create
    response1 = authenticated_client.post(url, payload, format="json")
    assert response1.status_code == 201

    # Duplicate create --> same fingerprint
    response2 = authenticated_client.post(url, payload, format="json")

    assert response2.status_code == 409
    assert "detail" in response2.data
    assert response2.json()["detail"] == (
        "A job posting with the same identity already exists."
    )


def test_reverse_job_posting_list():
    url = reverse("job-posting-list")
    assert url == "/api/v1/jobs/postings/"


def test_reverse_job_posting_detail(job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])
    assert url == f"/api/v1/jobs/postings/{job_posting.id}/"
