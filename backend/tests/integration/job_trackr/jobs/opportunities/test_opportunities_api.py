# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/jobs/opportunities/test_opportunities_api.py

from uuid import UUID

import pytest
from apps.jobs.opportunities.models import JobOpportunity
from apps.jobs.postings.models import JobPosting
from django.urls import reverse
from django.utils import timezone

pytestmark = pytest.mark.django_db


EXPECTED_DETAIL_FIELDS = {
    "id",
    "title",
    "company",
    "location",
    "notes",
    "priority",
    "description",
    "job_postings",
    "postings_count",
    "latest_posted_at",
}


@pytest.fixture
def job_opportunity():
    return JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        notes="Interesting role",
        priority="high",
    )


def test_list_job_opportunities(authenticated_client, job_opportunity):
    """
    Ensure the API returns active job opportunities.
    """
    url = reverse("job-opportunity-list")

    response = authenticated_client.get(url)

    assert response.status_code == 200
    data = response.json()

    assert len(data) >= 1
    assert data[0]["title"] == job_opportunity.title
    assert data[0]["company"] == job_opportunity.company

    assert data[0]["postings_count"] == 0
    assert data[0]["latest_posted_at"] is None


def test_retrieve_job_opportunity(authenticated_client, job_opportunity):
    """
    Ensure a single opportunity can be retrieved.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    response = authenticated_client.get(url)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == str(job_opportunity.id)
    assert data["title"] == job_opportunity.title
    assert data["company"] == job_opportunity.company

    assert data["postings_count"] == 0
    assert data["latest_posted_at"] is None


def test_create_job_opportunity(authenticated_client):
    """
    Ensure a job opportunity can be created via the API.
    """
    url = reverse("job-opportunity-list")

    payload = {
        "title": "Senior Backend Engineer",
        "company": "Datadog",
        "location": "Paris",
        "notes": "Looks promising",
        "priority": "medium",
    }

    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == 201

    data = response.json()

    assert set(data.keys()) >= EXPECTED_DETAIL_FIELDS

    # Validate identity fields
    assert "id" in data
    UUID(data["id"])

    assert data["title"] == payload["title"]
    assert data["company"] == payload["company"]
    assert data["location"] == payload["location"]
    assert data["notes"] == payload["notes"]
    assert data["priority"] == payload["priority"]

    # Validate derived / read-only fields
    assert data["postings_count"] == 0
    assert data["latest_posted_at"] is None

    # Validate fields specific to JobOpportunityDetailSerializer
    assert "description" in data
    assert data["description"] == ""

    assert "job_postings" in data
    assert isinstance(data["job_postings"], list)
    assert data["job_postings"] == []

    # Validate DB state
    assert JobOpportunity.objects.count() == 1

    job = JobOpportunity.objects.get(id=data["id"])

    assert job.title == payload["title"]
    assert job.company == payload["company"]
    assert job.location == payload["location"]
    assert job.description == ""


def test_partial_update_job_opportunity(authenticated_client, job_opportunity):
    """
    Ensure a job opportunity can be partially updated.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    payload = {
        "priority": "medium",
    }

    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == 200

    job_opportunity.refresh_from_db()

    assert job_opportunity.priority == "medium"


def test_delete_job_opportunity(authenticated_client, job_opportunity):
    """
    Ensure a job opportunity can be deleted.
    """
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    response = authenticated_client.delete(url)

    assert response.status_code == 204
    assert JobOpportunity.objects.count() == 0


def test_inactive_opportunities_not_listed(authenticated_client):
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

    response = authenticated_client.get(url)

    assert response.status_code == 200
    data = response.json()

    assert data == []


def test_retrieve_inactive_opportunity_returns_404(authenticated_client):
    """
    Ensure retrieving an inactive opportunity returns 404.
    """
    opportunity = JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        priority="high",
        is_active=False,
    )

    url = reverse("job-opportunity-detail", args=[opportunity.id])

    response = authenticated_client.get(url)

    assert response.status_code == 404


def test_update_inactive_opportunity_returns_404(authenticated_client):
    """
    Ensure updating an inactive opportunity returns 404.
    """
    opportunity = JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        priority="high",
        is_active=False,
    )

    url = reverse("job-opportunity-detail", args=[opportunity.id])

    payload = {
        "priority": "medium",
    }

    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == 404


def test_delete_inactive_opportunity_returns_404(authenticated_client):
    """
    Ensure deleting an inactive opportunity returns 404.
    """
    opportunity = JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        priority="high",
        is_active=False,
    )

    url = reverse("job-opportunity-detail", args=[opportunity.id])

    response = authenticated_client.delete(url)

    assert response.status_code == 404


def test_opportunity_metadata_with_postings(authenticated_client, job_opportunity):
    JobPosting.objects.create(
        job_opportunity=job_opportunity,
        title=job_opportunity.title,
        company=job_opportunity.company,
        raw_url="https://example.com/postings",
        platform="linkedin",
        posted_at=timezone.now(),
    )

    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    response = authenticated_client.get(url)

    assert response.status_code == 200

    data = response.json()

    assert data["postings_count"] == 1
    assert data["latest_posted_at"] is not None


def test_reverse_job_opportunity_list():
    url = reverse("job-opportunity-list")
    assert url == "/api/v1/jobs/opportunities/"


def test_reverse_job_opportunity_detail(job_opportunity):
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])
    assert url == f"/api/v1/jobs/opportunities/{job_opportunity.id}/"


def test_authentication_required(api_client):
    url = reverse("job-opportunity-list")

    response = api_client.get(url)

    assert response.status_code == 403


def test_create_duplicate_job_opportunity_returns_409(authenticated_client):
    """
    Ensure creating a duplicate opportunity returns HTTP 409.
    """
    url = reverse("job-opportunity-list")

    payload = {
        "title": "Backend Engineer",
        "company": "Stripe",
        "location": "Paris",
        "notes": "Interesting role",
        "priority": "high",
    }

    # First creation succeeds
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 201

    # Second creation with same identity triggers conflict
    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "A job opportunity with the same identity already exists."
    )


def test_full_update_job_opportunity(authenticated_client, job_opportunity):
    url = reverse("job-opportunity-detail", args=[job_opportunity.id])

    payload = {
        "title": "Updated Title",
        "company": "Stripe",
        "location": "Paris",
        "notes": "Updated",
        "priority": "low",
    }

    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == 200

    job_opportunity.refresh_from_db()
    assert job_opportunity.title == "Updated Title"


def test_session_authentication(api_client, user):
    """
    Ensure SessionAuthentication works with a Django session.
    """
    api_client.force_login(user)

    url = reverse("job-opportunity-list")

    response = api_client.get(url)

    assert response.status_code == 200
