# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/api/test_jobs_api.py

import pytest
from apps.jobs.models import JobOpportunity
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def job_opportunity():
    return JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        url="https://example.com/job",
        notes="Interesting role",
        priority="high",
    )


def test_list_job_opportunities(api_client, job_opportunity):
    """
    Ensure the API returns active job opportunities.
    """
    url = reverse("job-opportunity-list")

    response = api_client.get(url)

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == job_opportunity.title
    assert data[0]["company"] == job_opportunity.company


def test_retrieve_job_opportunity(api_client, job_opportunity):
    """
    Ensure a single opportunity can be retrieved.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    response = api_client.get(url)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == str(job_opportunity.id)
    assert data["title"] == job_opportunity.title
    assert data["company"] == job_opportunity.company


def test_create_job_opportunity(api_client):
    """
    Ensure a job opportunity can be created via the API.
    """
    url = reverse("job-opportunity-list")

    payload = {
        "title": "Senior Backend Engineer",
        "company": "Datadog",
        "location": "Paris",
        "url": "https://example.com/job",
        "notes": "Looks promising",
        "priority": "medium",
    }

    response = api_client.post(url, payload, format="json")

    assert response.status_code == 201

    assert JobOpportunity.objects.count() == 1

    job = JobOpportunity.objects.get(title=payload["title"])

    assert job.title == payload["title"]
    assert job.company == payload["company"]
    assert job.location == payload["location"]


def test_partial_update_job_opportunity(api_client, job_opportunity):
    """
    Ensure a job opportunity can be partially updated.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    payload = {
        "priority": "medium",
    }

    response = api_client.patch(url, payload, format="json")

    assert response.status_code == 200

    job_opportunity.refresh_from_db()

    assert job_opportunity.priority == "medium"


def test_delete_job_opportunity(api_client, job_opportunity):
    """
    Ensure a job opportunity can be deleted.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    response = api_client.delete(url)

    assert response.status_code == 204
    assert JobOpportunity.objects.count() == 0


def test_inactive_opportunities_not_listed(api_client):
    """
    Ensure inactive opportunities are not returned by the API.
    """
    JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        priority="high",
        is_active=False,
    )
    url = reverse("job-opportunity-list")

    response = api_client.get(url)

    assert response.status_code == 200
    data = response.json()

    assert data == []


def test_reverse_job_opportunity_list():
    url = reverse("job-opportunity-list")
    assert url == "/api/v1/jobs/opportunities/"


def test_reverse_job_opportunity_detail(job_opportunity):
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])
    assert url == f"/api/v1/jobs/opportunities/{job_opportunity.id}/"
