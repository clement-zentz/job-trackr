# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/postings/test_job_posting_api.py

import pytest
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.postings.models import JobPosting
from apps.jobs.tests.factories.job_posting import JobPostingFactory
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


@pytest.fixture
def job_posting():
    return JobPostingFactory()


JOB_POSTING_LIST_KEYS = {
    "id",
    "title",
    "company",
    "location",
    "url",
    "description_preview",
    "salary",
    "easy_apply",
    "active_hiring",
    "platform",
    "platform_label",
    "employment_type",
    "employment_type_label",
    "work_mode",
    "work_mode_label",
    "candidacy_id",
    "posted_at",
    "created_at",
    "updated_at",
}


JOB_POSTING_DETAIL_KEYS = JOB_POSTING_LIST_KEYS | {
    "description",
}


def assert_job_posting_list_shape(data: dict) -> None:
    assert data.keys() == JOB_POSTING_LIST_KEYS
    assert "description" not in data


def assert_job_posting_detail_shape(data: dict) -> None:
    assert data.keys() == JOB_POSTING_DETAIL_KEYS


def test_list_job_postings(authenticated_client, job_posting):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Pagination structure
    assert "count" in response.data
    assert "results" in response.data

    # Data assertions
    assert response.data["count"] >= 1

    item = next(
        (
            item
            for item in response.data["results"]
            if item["id"] == str(job_posting.id)
        ),
        None,
    )

    assert item is not None
    assert_job_posting_list_shape(item)


def test_retrieve_job_posting(authenticated_client):
    job_posting = JobPostingFactory(
        title="Backend Engineer",
        company="Stripe",
        location="Paris",
        url="https://example.com/job/1",
        description="Build backend services for payments and financial systems.",
        salary="60k-80k",
        easy_apply=True,
        active_hiring=True,
        platform=Platforms.LINKEDIN,
        employment_type=EmploymentType.FULL_TIME,
        work_mode=WorkMode.HYBRID,
    )

    url = reverse("job-posting-detail", args=[job_posting.id])

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert_job_posting_detail_shape(response.data)

    assert response.data["id"] == str(job_posting.id)
    assert response.data["title"] == job_posting.title
    assert response.data["company"] == job_posting.company
    assert response.data["location"] == job_posting.location
    assert response.data["url"] == job_posting.url
    assert response.data["description"] == job_posting.description
    assert response.data["salary"] == job_posting.salary
    assert response.data["easy_apply"] is True
    assert response.data["active_hiring"] is True
    assert response.data["platform"] == "linkedin"
    assert response.data["employment_type"] == "full_time"
    assert response.data["work_mode"] == "hybrid"
    assert response.data["candidacy_id"] is None


def test_create_job_posting(authenticated_client):
    url = reverse("job-posting-list")

    payload = {
        "title": "Frontend Engineer",
        "company": "Google",
        "location": "Lyon",
        "url": "https://example.com/job/2",
        "platform": "linkedin",
    }

    response = authenticated_client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert_job_posting_detail_shape(response.data)

    assert JobPosting.objects.filter(title="Frontend Engineer").exists()
    assert response.data["title"] == "Frontend Engineer"


def test_partial_update_job_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    payload = {
        "title": "Senior Backend Engineer",
    }

    response = authenticated_client.patch(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert_job_posting_detail_shape(response.data)

    job_posting.refresh_from_db()
    assert job_posting.title == "Senior Backend Engineer"


def test_full_update_job_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    payload = {
        "title": "Full Stack Engineer",
        "company": "Amazon",
        "location": "Lille",
        "url": "https://example.com/job/3",
        "platform": "indeed",
    }

    response = authenticated_client.put(url, payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert_job_posting_detail_shape(response.data)

    job_posting.refresh_from_db()
    assert job_posting.title == "Full Stack Engineer"
    assert job_posting.company == "Amazon"


def test_delete_job_posting(authenticated_client, job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])

    response = authenticated_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not (JobPosting.objects.filter(title="Backend Engineer").exists())


def test_authentication_required(api_client):
    url = reverse("job-posting-list")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_session_authentication(api_client, user):
    """
    Ensure SessionAuthentication works with a Django session.
    """
    api_client.force_login(user)

    url = reverse("job-posting-list")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK


def test_reverse_job_posting_list():
    url = reverse("job-posting-list")
    assert url == "/api/v1/jobs/postings/"


def test_reverse_job_posting_detail(job_posting):
    url = reverse("job-posting-detail", args=[job_posting.id])
    assert url == f"/api/v1/jobs/postings/{job_posting.id}/"
