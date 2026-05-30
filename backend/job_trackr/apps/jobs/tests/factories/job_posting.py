# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/factories/job_posting.py

from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.postings.models import JobPosting
from django.utils import timezone
from factory.declarations import LazyFunction, Sequence
from factory.django import DjangoModelFactory


class JobPostingFactory(DjangoModelFactory[JobPosting]):
    class Meta:
        model = JobPosting

    title = Sequence(lambda n: f"Backend Engineer {n}")
    company = Sequence(lambda n: f"Company {n}")
    location = "Paris"

    url = Sequence(lambda n: f"https://example.com/jobs/{n}")
    description = "Build backend services for payment and financial systems."
    salary = "60k-80k"

    easy_apply = False
    active_hiring = False

    posted_at = LazyFunction(timezone.now)

    platform = Platforms.UNKNOWN
    employment_type = EmploymentType.UNKNOWN
    work_mode = WorkMode.UNKNOWN
