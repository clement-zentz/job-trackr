# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/models/test_jobs_model.py

import pytest
from apps.jobs.models import JobOpportunity, JobPosting


@pytest.mark.django_db
def test_create_job_opportunity():
    job_opportunity = JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Acme Corp",
        location="Paris",
    )

    assert job_opportunity.id is not None
    assert job_opportunity.priority == "low"
    assert job_opportunity.is_active is True


@pytest.mark.django_db
def test_create_job_posting_linked_to_job_opportunity():
    job_opportunity = JobOpportunity.objects.create(
        title="Backend Engineer",
        company="Acme Corp",
    )

    job_posting = JobPosting.objects.create(
        job_opportunity=job_opportunity,
        title="Backend Engineer",
        company="Acme Corp",
        platform="linkedin",
        raw_url="https://linkedin.com/jobs/123",
    )

    assert job_posting.id is not None
    assert job_posting.job_opportunity == job_opportunity
    assert job_opportunity.job_postings.count() == 1
