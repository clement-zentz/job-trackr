# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/api/postings/test_job_posting_serializers.py

import pytest
from apps.jobs.api.postings.serializers import JobPostingReadSerializer
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.tests.factories.job_candidacy import JobCandidacyFactory
from apps.jobs.tests.factories.job_posting import JobPostingFactory
from django.utils.text import Truncator

pytestmark = pytest.mark.django_db


def test_job_posting_read_serializer_adds_description_preview():
    description = "A" * 500
    job_posting = JobPostingFactory(description=description)

    serializer = JobPostingReadSerializer(job_posting)

    assert serializer.data["description"] == description
    assert serializer.data["description_preview"] == Truncator(description).chars(240)


def test_job_posting_read_serializer_adds_choice_labels():
    job_posting = JobPostingFactory(
        platform=Platforms.INDEED,
        employment_type=EmploymentType.APPRENTICESHIP,
        work_mode=WorkMode.ON_SITE,
    )

    serializer = JobPostingReadSerializer(job_posting)

    assert serializer.data["platform_label"] == "Indeed"
    assert serializer.data["employment_type_label"] == "Apprenticeship"
    assert serializer.data["work_mode_label"] == "On-site"


def test_job_posting_read_serializer_returns_null_candidacy_id_without_candidacy():
    job_posting = JobPostingFactory()

    serializer = JobPostingReadSerializer(job_posting)

    assert serializer.data["candidacy_id"] is None


def test_job_posting_read_serializer_returns_candidacy_id_with_candidacy():
    job_posting = JobPostingFactory()
    candidacy = JobCandidacyFactory(job_posting=job_posting)

    serializer = JobPostingReadSerializer(job_posting)

    assert serializer.data["candidacy_id"] == str(candidacy.id)
