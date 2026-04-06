# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/jobs/postings/test_job_posting_pagination.py

import pytest
from django.urls import reverse

from tests.factories.job_opportunity import JobOpportunityFactory
from tests.factories.job_posting import JobPostingFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def shared_job_opportunity():
    return JobOpportunityFactory()


@pytest.fixture
def job_postings(shared_job_opportunity):
    return JobPostingFactory.create_batch(
        30,
        job_opportunity=shared_job_opportunity,
    )


def test_list_job_postings_is_paginated(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url)

    assert response.status_code == 200
    assert "count" in response.data
    assert "next" in response.data
    assert "previous" in response.data
    assert "results" in response.data


def test_list_job_postings_respects_page_size(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url, {"page_size": 10})

    assert response.status_code == 200
    assert response.data["count"] == 30
    assert len(response.data["results"]) == 10


def test_list_job_postings_multiple_pages(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    response_page_1 = authenticated_client.get(url, {"page": 1, "page_size": 5})
    response_page_2 = authenticated_client.get(url, {"page": 2, "page_size": 5})

    ids_page_1 = [item["id"] for item in response_page_1.data["results"]]
    ids_page_2 = [item["id"] for item in response_page_2.data["results"]]

    assert ids_page_1 != ids_page_2


def test_page_size_is_capped(authenticated_client, shared_job_opportunity):
    url = reverse("job-posting-list")

    JobPostingFactory.create_batch(
        130,  # more than 100
        job_opportunity=shared_job_opportunity,
    )

    response = authenticated_client.get(url, {"page_size": 1000})

    assert response.status_code == 200
    assert response.data["count"] == 130
    assert len(response.data["results"]) == 100  # max_page_size
    assert response.data["next"] is not None


def test_pagination_next_link(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url, {"page_size": 10})

    assert response.status_code == 200
    assert response.data["next"] is not None
    assert response.data["previous"] is None

    # Follow next link
    next_url = response.data["next"]
    next_response = authenticated_client.get(next_url)

    assert next_response.status_code == 200
    assert next_response.data["previous"] is not None


def test_pagination_previous_link(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    # Go directly to page 2
    response = authenticated_client.get(url, {"page": 2, "page_size": 10})

    assert response.status_code == 200
    assert response.data["previous"] is not None

    prev_url = response.data["previous"]
    prev_response = authenticated_client.get(prev_url)

    assert prev_response.status_code == 200


def test_pagination_navigation_consistency(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    page_1 = authenticated_client.get(url, {"page": 1, "page_size": 10})
    page_2 = authenticated_client.get(page_1.data["next"])

    # Go back using previous
    page_1_again = authenticated_client.get(page_2.data["previous"])

    ids_page_1 = [item["id"] for item in page_1.data["results"]]
    ids_page_1_again = [item["id"] for item in page_1_again.data["results"]]

    assert ids_page_1 == ids_page_1_again


def test_last_page_has_no_next(authenticated_client, job_postings):
    url = reverse("job-posting-list")

    response = authenticated_client.get(url, {"page": 3, "page_size": 10})

    assert response.status_code == 200
    assert len(response.data["results"]) == 10
    assert response.data["previous"] is not None
    assert response.data["next"] is None
