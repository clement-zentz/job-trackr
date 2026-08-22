# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/postings/test_job_posting_queries.py

from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.jobs.tests.factories.job_candidacy import JobCandidacyFactory
from apps.jobs.tests.factories.job_posting import JobPostingFactory

pytestmark = pytest.mark.django_db


def test_list_job_postings_supports_search_by_title(authenticated_client, user):
    JobPostingFactory(owner=user, title="Senior Python Developer")
    JobPostingFactory(owner=user, title="Frontend React Engineer")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"search": "Python"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["title"] == "Senior Python Developer"


def test_list_job_postings_supports_search_by_company(authenticated_client, user):
    JobPostingFactory(owner=user, company="OpenAI")
    JobPostingFactory(owner=user, company="Google")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"search": "OpenAI"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["company"] == "OpenAI"


def test_list_job_postings_filters_by_platform(authenticated_client, user):
    JobPostingFactory(owner=user, platform="linkedin")
    JobPostingFactory(owner=user, platform="indeed")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"platform": "linkedin"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["platform"] == "linkedin"


def test_list_job_postings_filters_by_easy_apply(authenticated_client, user):
    JobPostingFactory(owner=user, easy_apply=True)
    JobPostingFactory(owner=user, easy_apply=False)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"easy_apply": True},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["easy_apply"] is True


def test_list_job_postings_filters_by_active_hiring(authenticated_client, user):
    JobPostingFactory(owner=user, active_hiring=True)
    JobPostingFactory(owner=user, active_hiring=False)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"active_hiring": True},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["active_hiring"] is True


def test_list_job_postings_filters_by_posted_on_after(authenticated_client, user):
    old_posting = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=10)).isoformat(),
    )
    recent_posting = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=1)).isoformat(),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"posted_on_after": (timezone.localdate() - timedelta(days=5)).isoformat()},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(recent_posting.id) in returned_ids
    assert str(old_posting.id) not in returned_ids


def test_list_job_postings_filters_by_posted_on_before(authenticated_client, user):
    old_posting = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=10)).isoformat(),
    )
    recent_posting = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=1)).isoformat(),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"posted_on_before": (timezone.localdate() - timedelta(days=5)).isoformat()},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(old_posting.id) in returned_ids
    assert str(recent_posting.id) not in returned_ids


def test_list_job_postings_supports_ordering_by_posted_on_desc(
    authenticated_client, user
):
    older = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=10)).isoformat(),
    )
    newer = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=1)).isoformat(),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"), {"ordering": "-posted_on"}
    )

    assert response.status_code == 200

    results = response.data["results"]

    assert results[0]["id"] == str(newer.id)
    assert results[1]["id"] == str(older.id)


def test_list_job_postings_supports_ordering_by_posted_on_asc(
    authenticated_client, user
):
    older = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=10)).isoformat(),
    )
    newer = JobPostingFactory(
        owner=user,
        posted_on=(timezone.localdate() - timedelta(days=1)).isoformat(),
    )

    response = authenticated_client.get(
        reverse("job-posting-list"), {"ordering": "posted_on"}
    )

    assert response.status_code == 200

    results = response.data["results"]

    assert results[0]["id"] == str(older.id)
    assert results[1]["id"] == str(newer.id)


def test_list_job_postings_combines_search_filters_and_ordering(
    authenticated_client, user
):
    matching_old = JobPostingFactory(
        owner=user,
        title="Python Developer",
        platform="linkedin",
        posted_on=(timezone.localdate() - timedelta(days=5)).isoformat(),
    )
    matching_new = JobPostingFactory(
        owner=user,
        title="Senior Python Engineer",
        platform="linkedin",
        posted_on=(timezone.localdate() - timedelta(days=1)).isoformat(),
    )
    JobPostingFactory(
        owner=user,
        title="Python Developer",
        platform="indeed",
    )
    JobPostingFactory(
        owner=user,
        title="Frontend Developer",
        platform="linkedin",
    )

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {
            "search": "Python",
            "platform": "linkedin",
            "ordering": "-posted_on",
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
def test_list_job_postings_filters_by_has_salary(
    authenticated_client,
    user,
    has_salary,
    expected_with_salary,
    expected_without_salary,
):
    with_salary = JobPostingFactory(owner=user, salary="5000 €")
    without_salary = JobPostingFactory(owner=user, salary="")

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
    "has_candidacy, expected_with_candidacy, expected_without_candidacy",
    [
        (True, True, False),
        (False, False, True),
    ],
)
def test_list_job_postings_filters_by_has_candidacy(
    authenticated_client,
    user,
    has_candidacy,
    expected_with_candidacy,
    expected_without_candidacy,
):
    with_candidacy = JobPostingFactory(owner=user)
    JobCandidacyFactory(job_posting=with_candidacy)

    without_candidacy = JobPostingFactory(owner=user)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"has_candidacy": has_candidacy},
    )

    assert response.status_code == 200

    returned_ids = {item["id"] for item in response.data["results"]}

    if expected_with_candidacy:
        assert str(with_candidacy.id) in returned_ids
    else:
        assert str(with_candidacy.id) not in returned_ids

    if expected_without_candidacy:
        assert str(without_candidacy.id) in returned_ids
    else:
        assert str(without_candidacy.id) not in returned_ids


def test_list_job_postings_filters_by_company_icontains(authenticated_client, user):
    matching = JobPostingFactory(owner=user, company="OpenAI")
    no_matching = JobPostingFactory(owner=user, company="Google")

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {"company": "open"},  # case-insensitive partial
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(matching.id) in returned_ids
    assert str(no_matching.id) not in returned_ids


def test_list_job_postings_combines_active_hiring_and_company_filters(
    authenticated_client,
    user,
):
    matching = JobPostingFactory(owner=user, company="OpenAI", active_hiring=True)
    no_matching1 = JobPostingFactory(owner=user, company="OpenAI", active_hiring=False)
    no_matching2 = JobPostingFactory(owner=user, company="Google", active_hiring=True)

    response = authenticated_client.get(
        reverse("job-posting-list"),
        {
            "company": "open",
            "active_hiring": True,
        },
    )

    returned_ids = {item["id"] for item in response.data["results"]}

    assert str(matching.id) in returned_ids
    assert str(no_matching1.id) not in returned_ids
    assert str(no_matching2.id) not in returned_ids
