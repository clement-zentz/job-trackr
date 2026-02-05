# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/models/test_job_applications.py

import datetime

import pytest
from apps.job_applications.models import JobApplication, JobApplicationStatus
from apps.jobs.models import JobOpportunity, JobPosting


@pytest.mark.django_db
def test_create_job_application_without_posting():
    job_opportunity = JobOpportunity.objects.create(
        title="Frontend Engineer", company="Example Ltd"
    )

    job_application = JobApplication.objects.create(
        job_opportunity=job_opportunity,
        job_application_date=datetime.date.today(),
    )

    assert job_application.id is not None
    assert job_application.job_posting is None
    assert job_application.status == JobApplicationStatus.APPLIED


@pytest.mark.django_db
def test_create_job_application_with_posting():
    job_opportunity = JobOpportunity.objects.create(
        title="Frontend Engineer",
        company="Example Ltd",
    )

    job_posting = JobPosting.objects.create(
        job_opportunity=job_opportunity,
        title="Frontend Engineer",
        company="Example Ltd",
        platform="indeed",
        raw_url="https://indeed.com/jobs/456",
    )

    job_application = JobApplication.objects.create(
        job_opportunity=job_opportunity,
        job_posting=job_posting,
        job_application_date=datetime.date.today(),
    )

    assert job_application.job_posting == job_posting
    assert job_posting.job_applications.count() == 1
