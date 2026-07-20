# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/candidacies/test_job_candidacy_api.py

from datetime import date

import pytest
from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy
from apps.jobs.postings.models import JobPosting
from apps.jobs.tests.factories.job_candidacy import JobCandidacyFactory
from apps.jobs.tests.factories.job_posting import JobPostingFactory
from django.urls import reverse
from django.utils.text import Truncator
from rest_framework import status

pytestmark = pytest.mark.django_db


@pytest.fixture
def job_candidacy():
    return JobCandidacyFactory()


JOB_CANDIDACY_LIST_KEYS = {
    "id",
    "job_posting",
    "status",
    "status_label",
    "applied_on",
    "notes_preview",
    "created_at",
    "updated_at",
}

JOB_CANDIDACY_DETAIL_KEYS = JOB_CANDIDACY_LIST_KEYS | {
    "notes",
}


def assert_job_candidacy_list_shape(data: dict) -> None:
    assert data.keys() == JOB_CANDIDACY_LIST_KEYS
    assert "notes" not in data


def assert_job_candidacy_detail_shape(data: dict) -> None:
    assert data.keys() == JOB_CANDIDACY_DETAIL_KEYS


def test_list_job_candidacies(authenticated_client):
    notes = (
        "I applied after reviewing the role and adapting my CV. "
        "The position matches my backend development experience. "
        "Follow up with the recruiter next week."
    )
    job_candidacy = JobCandidacyFactory(notes=notes)

    url = reverse("job-candidacy-list")

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK

    # Pagination structure
    assert "count" in response.data
    assert "results" in response.data

    # Data assertions
    assert response.data["count"] == 1

    item = next(
        (
            item
            for item in response.data["results"]
            if item["id"] == str(job_candidacy.id)
        ),
        None,
    )

    assert item is not None
    assert_job_candidacy_list_shape(item)
    assert str(item["job_posting"]) == str(job_candidacy.job_posting_id)
    assert item["status"] == job_candidacy.status
    assert item["status_label"] == job_candidacy.get_status_display()
    assert item["applied_on"] == job_candidacy.applied_on.isoformat()
    assert item["notes_preview"] == Truncator(notes).chars(100)


def test_retrieve_job_candidacy(authenticated_client):
    applied_on = date(2026, 7, 15)
    notes = (
        "The first interview went well. "
        "A technical interview is scheduled for next week."
    )
    job_candidacy = JobCandidacyFactory(
        status=CandidacyStatus.INTERVIEW,
        applied_on=applied_on,
        notes=notes,
    )

    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )

    response = authenticated_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert_job_candidacy_detail_shape(response.data)
    assert response.data["id"] == str(job_candidacy.id)
    assert str(response.data["job_posting"]) == str(job_candidacy.job_posting_id)
    assert response.data["status"] == CandidacyStatus.INTERVIEW
    assert response.data["status_label"] == CandidacyStatus.INTERVIEW.label
    assert response.data["applied_on"] == applied_on.isoformat()
    assert response.data["notes_preview"] == Truncator(notes).chars(100)
    assert response.data["notes"] == notes


def test_create_job_candidacy(authenticated_client):
    job_posting = JobPostingFactory()
    applied_on = date(2026, 7, 18)
    notes = "Application submitted through the company website."

    url = reverse("job-candidacy-list")
    payload = {
        "job_posting": str(job_posting.id),
        "status": CandidacyStatus.APPLIED,
        "applied_on": applied_on.isoformat(),
        "notes": notes,
    }

    response = authenticated_client.post(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert_job_candidacy_detail_shape(response.data)

    job_candidacy = JobCandidacy.objects.get(
        job_posting=job_posting,
    )

    assert response.data["id"] == str(job_candidacy.id)
    assert str(response.data["job_posting"]) == str(job_posting.id)
    assert response.data["status"] == CandidacyStatus.APPLIED
    assert response.data["status_label"] == CandidacyStatus.APPLIED.label
    assert response.data["applied_on"] == applied_on.isoformat()
    assert response.data["notes"] == notes
    assert response.data["notes_preview"] == notes

    assert job_candidacy.status == CandidacyStatus.APPLIED
    assert job_candidacy.applied_on == applied_on
    assert job_candidacy.notes == notes


def test_create_job_candidacy_requires_job_posting(
    authenticated_client,
):
    url = reverse("job-candidacy-list")
    payload = {
        "status": CandidacyStatus.APPLIED,
        "applied_on": "2026-07-18",
        "notes": "Missing job posting.",
    }

    response = authenticated_client.post(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "job_posting" in response.data
    assert JobCandidacy.objects.count() == 0


def test_cannot_create_two_candidacies_for_same_job_posting(
    authenticated_client,
    job_candidacy,
):
    url = reverse("job-candidacy-list")
    payload = {
        "job_posting": str(job_candidacy.job_posting_id),
        "status": CandidacyStatus.APPLIED,
        "applied_on": "2026-07-18",
        "notes": "Duplicate candidacy.",
    }

    response = authenticated_client.post(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "job_posting" in response.data
    assert (
        JobCandidacy.objects.filter(
            job_posting_id=job_candidacy.job_posting_id,
        ).count()
        == 1
    )


def test_partial_update_job_candidacy(
    authenticated_client,
    job_candidacy,
):
    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )
    payload = {
        "status": CandidacyStatus.INTERVIEW,
        "notes": "Recruiter interview scheduled.",
    }

    response = authenticated_client.patch(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert_job_candidacy_detail_shape(response.data)

    job_candidacy.refresh_from_db()

    assert job_candidacy.status == CandidacyStatus.INTERVIEW
    assert job_candidacy.notes == "Recruiter interview scheduled."
    assert response.data["status"] == CandidacyStatus.INTERVIEW
    assert response.data["notes"] == "Recruiter interview scheduled."


def test_full_update_job_candidacy(
    authenticated_client,
    job_candidacy,
):
    applied_on = date(2026, 7, 16)
    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )
    payload = {
        "job_posting": str(job_candidacy.job_posting_id),
        "status": CandidacyStatus.REJECTED,
        "applied_on": applied_on.isoformat(),
        "notes": "The company selected another candidate.",
    }

    response = authenticated_client.put(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert_job_candidacy_detail_shape(response.data)

    job_candidacy.refresh_from_db()

    assert job_candidacy.status == CandidacyStatus.REJECTED
    assert job_candidacy.applied_on == applied_on
    assert job_candidacy.notes == ("The company selected another candidate.")
    assert response.data["status"] == CandidacyStatus.REJECTED
    assert response.data["applied_on"] == applied_on.isoformat()


def test_full_update_requires_job_posting(
    authenticated_client,
    job_candidacy,
):
    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )
    payload = {
        "status": CandidacyStatus.WITHDRAWN,
        "applied_on": "2026-07-17",
        "notes": "No longer interested in the position.",
    }

    response = authenticated_client.put(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "job_posting" in response.data


def test_job_posting_cannot_be_changed(
    authenticated_client,
    job_candidacy,
):
    original_job_posting_id = job_candidacy.job_posting_id
    replacement_job_posting = JobPostingFactory()

    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )
    payload = {
        "job_posting": str(replacement_job_posting.id),
    }

    response = authenticated_client.patch(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "job_posting" in response.data
    assert str(response.data["job_posting"][0]) == (
        "The job posting cannot be changed after the candidacy has been created."
    )

    job_candidacy.refresh_from_db()

    assert job_candidacy.job_posting_id == original_job_posting_id


def test_invalid_status_is_rejected(
    authenticated_client,
    job_candidacy,
):
    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )
    payload = {
        "status": "unknown_status",
    }

    original_status = job_candidacy.status

    response = authenticated_client.patch(
        url,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "status" in response.data

    job_candidacy.refresh_from_db()

    assert job_candidacy.status == original_status


def test_delete_job_candidacy(
    authenticated_client,
    job_candidacy,
):
    job_candidacy_id = job_candidacy.id
    job_posting_id = job_candidacy.job_posting_id

    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )

    response = authenticated_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not JobCandidacy.objects.filter(
        id=job_candidacy_id,
    ).exists()

    # Deleting the candidacy must not delete its job posting.
    assert JobPosting.objects.filter(id=job_posting_id).exists()


def test_authentication_required(api_client):
    url = reverse("job-candidacy-list")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_session_authentication(api_client, user):
    """
    Ensure SessionAuthentication works with a Django session.
    """
    api_client.force_login(user)

    url = reverse("job-candidacy-list")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK


def test_reverse_job_candidacy_list():
    url = reverse("job-candidacy-list")

    assert url == "/api/v1/jobs/candidacies/"


def test_reverse_job_candidacy_detail(job_candidacy):
    url = reverse(
        "job-candidacy-detail",
        args=[job_candidacy.id],
    )

    assert url == (f"/api/v1/jobs/candidacies/{job_candidacy.id}/")
