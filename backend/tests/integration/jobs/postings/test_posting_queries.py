# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/jobs/postings/test_posting_queries.py

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from tests.factories.job_opportunity import JobOpportunityFactory
from tests.factories.job_posting import JobPostingFactory

pytestmark = pytest.mark.django_db


def test_list_job_postings_supports_search_by_title(authenticated_client):
    JobPostingFactory(title="Senior Python Developer")
    JobPostingFactory(title="Frontend React Engineer")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"search": "Python"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["title"] == "Senior Python Developer"


def test_list_job_postings_supports_search_by_company(authenticated_client):
    JobPostingFactory(company="OpenAI")
    JobPostingFactory(company="Google")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"search": "OpenAI"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["company"] == "OpenAI"


def test_list_job_postings_filters_by_platform(authenticated_client):
    JobPostingFactory(platform="linkedin")
    JobPostingFactory(platform="indeed")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"platform": "linkedin"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["platform"] == "linkedin"


def test_list_job_postings_filters_by_easy_apply(authenticated_client):
    JobPostingFactory(easy_apply=True)
    JobPostingFactory(easy_apply=False)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"easy_apply": True},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["easy_apply"] is True


def test_list_job_postings_filters_by_active_hiring(authenticated_client):
    JobPostingFactory(active_hiring=True)
    JobPostingFactory(active_hiring=False)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"active_hiring": True},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["active_hiring"] is True


def test_list_job_postings_filters_by_posted_at_after(authenticated_client):
    old_posting = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=10),
    )
    recent_posting = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=1),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"posted_at_after": timezone.now() - timedelta(days=5)},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(recent_posting.id) in returned_ids
    assert str(old_posting.id) not in returned_ids


def test_list_job_postings_filters_by_posted_at_before(authenticated_client):
    old_posting = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=10),
    )
    recent_posting = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=1),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"posted_at_before": timezone.now() - timedelta(days=5)},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(old_posting.id) in returned_ids
    assert str(recent_posting.id) not in returned_ids


def test_list_job_postings_supports_ordering_by_posted_at_desc(authenticated_client):
    older = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=10),
    )
    newer = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=1),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"), {"ordering": "-posted_at"}
    )

    assert response.status_code == 200

    results = response.data["results"]

    assert results[0]["id"] == str(newer.id)
    assert results[1]["id"] == str(older.id)


def test_list_job_postings_supports_ordering_by_posted_at_asc(authenticated_client):
    older = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=10),
    )
    newer = JobPostingFactory(
        posted_at=timezone.now() - timedelta(days=1),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"), {"ordering": "posted_at"}
    )

    assert response.status_code == 200

    results = response.data["results"]

    assert results[0]["id"] == str(older.id)
    assert results[1]["id"] == str(newer.id)


def test_list_job_postings_combines_search_filters_and_ordering(authenticated_client):
    matching_old = JobPostingFactory(
        title="Python Developer",
        platform="linkedin",
        posted_at=timezone.now() - timedelta(days=5),
    )
    matching_new = JobPostingFactory(
        title="Senior Python Engineer",
        platform="linkedin",
        posted_at=timezone.now() - timedelta(days=1),
    )
    JobPostingFactory(
        title="Python Developer",
        platform="indeed",
    )
    JobPostingFactory(
        title="Frontend Developer",
        platform="linkedin",
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {
            "search": "Python",
            "platform": "linkedin",
            "ordering": "-posted_at",
        },
    )

    assert response.status_code == 200
    assert response.data["count"] == 2

    results = response.data["results"]

    assert results[0]["id"] == str(matching_new.id)
    assert results[1]["id"] == str(matching_old.id)


@pytest.mark.parametrize(
    "has_salary, expected_with_salary, expected_without_salary",
    [
        (True, True, False),
        (False, False, True),
    ],
)
def test_list_job_postings_by_has_salary(
    authenticated_client,
    has_salary,
    expected_with_salary,
    expected_without_salary,
):
    with_salary = JobPostingFactory(salary="5000 €")
    without_salary = JobPostingFactory(salary="")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"has_salary": has_salary},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    if expected_with_salary:
        assert str(with_salary.id) in returned_ids
    else:
        assert str(with_salary.id) not in returned_ids

    if expected_without_salary:
        assert str(without_salary.id) in returned_ids
    else:
        assert str(without_salary.id) not in returned_ids


@pytest.mark.parametrize(
    "has_job_opportunity, expected_with_job_opportunity, expected_without_job_opportunity",
    [
        (True, True, False),
        (False, False, True),
    ],
)
def test_list_job_postings_by_has_job_opportunity(
    authenticated_client,
    has_job_opportunity,
    expected_with_job_opportunity,
    expected_without_job_opportunity,
):
    job_opportunity = JobOpportunityFactory()

    with_job_opportunity = JobPostingFactory(job_opportunity=job_opportunity)
    without_job_opportunity = JobPostingFactory(job_opportunity=None)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"has_job_opportunity": has_job_opportunity},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    if expected_with_job_opportunity:
        assert str(with_job_opportunity.id) in returned_ids
    else:
        assert str(with_job_opportunity.id) not in returned_ids

    if expected_without_job_opportunity:
        assert str(without_job_opportunity.id) in returned_ids
    else:
        assert str(without_job_opportunity.id) not in returned_ids


def test_list_job_postings_filters_by_rating_min(authenticated_client):
    low = JobPostingFactory(rating=2.0)
    high = JobPostingFactory(rating=4.5)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"rating_min": 3.0},
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(high.id) in returned_ids
    assert str(low.id) not in returned_ids


def test_list_job_postings_filters_by_rating_max(authenticated_client):
    low = JobPostingFactory(rating=2.0)
    high = JobPostingFactory(rating=4.5)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"rating_max": 3.0},
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(low.id) in returned_ids
    assert str(high.id) not in returned_ids


def test_list_job_postings_filters_by_company_icontains(authenticated_client):
    matching = JobPostingFactory(company="OpenAI")
    no_matching = JobPostingFactory(company="Google")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"company": "open"},  # case-insensitive partial
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(matching.id) in returned_ids
    assert str(no_matching.id) not in returned_ids


def test_list_job_postings_combines_rating_and_company_filters(authenticated_client):
    matching = JobPostingFactory(company="OpenAI", rating=4.5)
    no_matching1 = JobPostingFactory(company="OpenAI", rating=2.0)
    no_matching2 = JobPostingFactory(company="Google", rating=4.5)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {
            "company": "open",
            "rating_min": 4.0,
        },
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(matching.id) in returned_ids
    assert str(no_matching1.id) not in returned_ids
    assert str(no_matching2.id) not in returned_ids
