# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/demo_data/job_posting.py

import random

from django.utils import timezone
from factory.declarations import Iterator, LazyAttribute, LazyFunction, Sequence
from factory.django import DjangoModelFactory
from factory.faker import Faker

from apps.jobs.postings.choices import EmploymentType, Platforms, WorkMode
from apps.jobs.postings.models import JobPosting


class DemoJobPostingFactory(DjangoModelFactory[JobPosting]):
    class Meta:
        model = JobPosting

    title = Faker("job")
    company = Faker("company")
    location = Faker("city")

    url = Sequence(lambda n: f"https://example.com/jobs/{n}")

    salary = LazyFunction(lambda: f"{random.randrange(55, 130, 5)}k € / year")

    description = LazyAttribute(
        lambda obj: (
            f"{obj.company} is looking for a {obj.title} to join its engineering team. "
            "You will work on product features, improve code quality, and collaborate "
            "with backend, frontend, and product teams."
        )
    )

    easy_apply = Faker("boolean")
    active_hiring = Faker("boolean")

    posted_at = Faker(
        "date_time_between",
        start_date="-30d",
        end_date="now",
        tzinfo=timezone.get_current_timezone(),
    )

    platform = Iterator([choice for choice, _label in Platforms.choices])

    employment_type = Iterator([choice for choice, _label in EmploymentType.choices])

    work_mode = Iterator([choice for choice, _label in WorkMode.choices])
