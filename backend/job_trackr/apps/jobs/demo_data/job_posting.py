# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/demo_data/job_posting.py

import random

from factory.declarations import (
    Iterator,
    LazyAttribute,
    LazyFunction,
    Sequence,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.faker import Faker

from apps.common.demo_data.constants import (
    COMPANIES,
    JOB_TITLES,
    LOCATIONS,
)
from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.postings.models import JobPosting
from apps.users.demo_data.user import DemoUserFactory


def generate_salary() -> str:
    salary = random.randrange(55, 130, 5)
    return f"{salary}k € / year"


class DemoJobPostingFactory(DjangoModelFactory[JobPosting]):
    class Meta:
        model = JobPosting

    owner = SubFactory(DemoUserFactory)

    title = Iterator(JOB_TITLES)
    company = Iterator(COMPANIES)
    location = Iterator(LOCATIONS)

    url = Sequence(lambda n: f"https://example.com/jobs/{n}")

    salary = LazyFunction(generate_salary)

    description = LazyAttribute(
        lambda obj: (
            f"{obj.company} is looking for a {obj.title} to join its engineering team. "
            "You will work on product features, improve code quality, and collaborate "
            "with backend, frontend, and product teams."
        )
    )

    easy_apply = Faker("boolean")
    active_hiring = Faker("boolean")

    posted_on = Faker(
        "date_between",
        start_date="-30d",
        end_date="today",
    )

    platform = Iterator(Platforms.values)
    employment_type = Iterator(EmploymentType.values)
    work_mode = Iterator(WorkMode.values)
