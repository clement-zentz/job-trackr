# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/candidacies/test_job_candidacy_filters.py

from datetime import date
from uuid import UUID

import pytest

from apps.jobs.api.candidacies.filters import JobCandidacyFilter
from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.tests.factories.job_candidacy import JobCandidacyFactory

pytestmark = pytest.mark.django_db


def get_filtered_ids(data: dict[str, str]) -> set[UUID]:
    filterset = JobCandidacyFilter(
        data=data,
        queryset=JobCandidacy.objects.all(),
    )

    assert filterset.is_valid(), filterset.errors

    return set(filterset.qs.values_list("id", flat=True))


@pytest.mark.parametrize(
    ("filter_name", "filter_value", "matching_kwargs", "non_matching_kwargs"),
    [
        (
            "status",
            CandidacyStatus.INTERVIEW,
            {"status": CandidacyStatus.INTERVIEW},
            {"status": CandidacyStatus.REJECTED},
        ),
        (
            "platform",
            Platforms.LINKEDIN,
            {"job_posting__platform": Platforms.LINKEDIN},
            {"job_posting__platform": Platforms.INDEED},
        ),
        (
            "employment_type",
            EmploymentType.FULL_TIME,
            {"job_posting__employment_type": EmploymentType.FULL_TIME},
            {"job_posting__employment_type": EmploymentType.PART_TIME},
        ),
        (
            "work_mode",
            WorkMode.REMOTE,
            {"job_posting__work_mode": WorkMode.REMOTE},
            {"job_posting__work_mode": WorkMode.ON_SITE},
        ),
    ],
)
def test_filter_job_candidacies_by_choice_field(
    filter_name,
    filter_value,
    matching_kwargs,
    non_matching_kwargs,
):
    matching_candidacy = JobCandidacyFactory(**matching_kwargs)
    JobCandidacyFactory(**non_matching_kwargs)

    result_ids = get_filtered_ids({filter_name: filter_value})

    assert result_ids == {matching_candidacy.id}


def test_filter_job_candidacies_applied_on_after():
    JobCandidacyFactory(applied_on=date(2026, 1, 1))
    boundary_candidacy = JobCandidacyFactory(applied_on=date(2026, 1, 15))
    later_candidacy = JobCandidacyFactory(applied_on=date(2026, 1, 31))

    result_ids = get_filtered_ids(
        {"applied_on_after": "2026-01-15"},
    )

    assert result_ids == {
        boundary_candidacy.id,
        later_candidacy.id,
    }


def test_filter_job_candidacies_applied_on_before():
    earlier_candidacy = JobCandidacyFactory(applied_on=date(2026, 1, 1))
    boundary_candidacy = JobCandidacyFactory(applied_on=date(2026, 1, 15))
    JobCandidacyFactory(applied_on=date(2026, 1, 31))

    result_ids = get_filtered_ids(
        {"applied_on_before": "2026-01-15"},
    )

    assert result_ids == {
        earlier_candidacy.id,
        boundary_candidacy.id,
    }


def test_filter_job_candidacies_by_applied_on_range():
    JobCandidacyFactory(applied_on=date(2026, 1, 9))
    matching_candidacy = JobCandidacyFactory(applied_on=date(2026, 1, 15))
    JobCandidacyFactory(applied_on=date(2026, 1, 21))

    result_ids = get_filtered_ids(
        {
            "applied_on_after": "2026-01-10",
            "applied_on_before": "2026-01-20",
        },
    )

    assert result_ids == {matching_candidacy.id}


def test_filter_job_candidacies_combines_filters():
    matching_candidacy = JobCandidacyFactory(
        status=CandidacyStatus.INTERVIEW,
        job_posting__platform=Platforms.LINKEDIN,
        job_posting__employment_type=EmploymentType.FULL_TIME,
        job_posting__work_mode=WorkMode.REMOTE,
    )
    JobCandidacyFactory(
        status=CandidacyStatus.APPLIED,
        job_posting__platform=Platforms.LINKEDIN,
        job_posting__employment_type=EmploymentType.FULL_TIME,
        job_posting__work_mode=WorkMode.REMOTE,
    )
    JobCandidacyFactory(
        status=CandidacyStatus.INTERVIEW,
        job_posting__platform=Platforms.INDEED,
        job_posting__employment_type=EmploymentType.FULL_TIME,
        job_posting__work_mode=WorkMode.REMOTE,
    )

    result_ids = get_filtered_ids(
        {
            "status": CandidacyStatus.INTERVIEW,
            "platform": Platforms.LINKEDIN,
            "employment_type": EmploymentType.FULL_TIME,
            "work_mode": WorkMode.REMOTE,
        },
    )

    assert result_ids == {matching_candidacy.id}


@pytest.mark.parametrize(
    "filter_name",
    [
        "status",
        "platform",
        "employment_type",
        "work_mode",
    ],
)
def test_filter_rejects_invalid_choice(filter_name):
    filterset = JobCandidacyFilter(
        data={filter_name: "invalid"},
        queryset=JobCandidacy.objects.all(),
    )

    assert not filterset.is_valid()
    assert filter_name in filterset.errors
