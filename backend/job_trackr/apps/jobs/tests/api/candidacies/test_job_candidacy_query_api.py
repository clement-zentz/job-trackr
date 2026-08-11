# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/candidacies/test_job_candidacy_query_api.py

from datetime import date

import pytest
from django.urls import reverse

from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.tests.factories.job_candidacy import JobCandidacyFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def job_candidacy_list_url() -> str:
    return reverse("job-candidacy-list")


def test_list_job_candidacies_filters_by_status(
    authenticated_client, job_candidacy_list_url
):
    matching_candidacy = JobCandidacyFactory(
        status=CandidacyStatus.INTERVIEW,
    )
    JobCandidacyFactory(
        status=CandidacyStatus.REJECTED,
    )

    response = authenticated_client.get(
        job_candidacy_list_url,
        {"status": CandidacyStatus.INTERVIEW},
    )

    assert response.status_code == 200

    result_ids = {item["id"] for item in response.data["results"]}

    assert result_ids == {str(matching_candidacy.id)}


def test_list_job_candidacies_searches_by_company(
    authenticated_client, job_candidacy_list_url
):
    matching_candidacy = JobCandidacyFactory(
        job_posting__company="Acme",
    )
    JobCandidacyFactory(
        job_posting__company="Globex",
    )

    response = authenticated_client.get(
        job_candidacy_list_url,
        {"search": "Acme"},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [
        str(matching_candidacy.id)
    ]


def test_list_job_candidacies_orders_by_applied_on(
    authenticated_client,
    job_candidacy_list_url,
):
    earlier = JobCandidacyFactory(
        applied_on=date(2026, 1, 1),
    )
    later = JobCandidacyFactory(
        applied_on=date(2026, 1, 31),
    )

    response = authenticated_client.get(
        job_candidacy_list_url,
        {"ordering": "applied_on"},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [
        str(earlier.id),
        str(later.id),
    ]


def test_list_job_candidacies_uses_default_ordering(
    authenticated_client,
    job_candidacy_list_url,
):
    earlier = JobCandidacyFactory(
        applied_on=date(2026, 1, 1),
    )
    later = JobCandidacyFactory(
        applied_on=date(2026, 1, 31),
    )

    response = authenticated_client.get(job_candidacy_list_url)

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [
        str(later.id),
        str(earlier.id),
    ]
