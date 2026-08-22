# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/tests/factories/job_posting.py

from factory.declarations import Sequence, SubFactory
from factory.django import DjangoModelFactory

from apps.jobs.postings.models import JobPosting
from apps.users.tests.factories.user import UserFactory


class JobPostingFactory(DjangoModelFactory[JobPosting]):
    class Meta:
        model = JobPosting

    owner = SubFactory(UserFactory)

    title = Sequence(lambda n: f"Backend Engineer {n}")
    company = Sequence(lambda n: f"Company {n}")
    location = "Paris"

    url = ""
    description = ""
    salary = ""

    easy_apply = False
    active_hiring = False

    posted_on = None

    platform = ""
    employment_type = ""
    work_mode = ""
