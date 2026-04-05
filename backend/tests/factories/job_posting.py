# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/factories/job_posting.py

import random
from datetime import timedelta

import factory
from apps.jobs.postings.models import JobPosting
from django.utils import timezone
from factory.declarations import (
    Iterator,
    LazyAttribute,
    LazyFunction,
    Sequence,
    SubFactory,
)
from factory.faker import Faker

from tests.factories.job_opportunity import JobOpportunityFactory


class JobPostingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobPosting

    job_opportunity = SubFactory(JobOpportunityFactory)

    title = Sequence(lambda n: f"Backend Developer {n}")
    company = Faker("company")
    platform = Iterator(["linkedin", "indeed", "wttj"])

    raw_url = Sequence(lambda n: f"https://example.com/job/{n}")
    canonical_url = LazyAttribute(lambda obj: obj.raw_url)

    job_key = Sequence(lambda n: f"job-{n}")

    location = Faker("city")

    summary = Faker("sentence")
    description = Faker("text")

    salary = LazyFunction(lambda: f"{random.randint(30000, 120000)} €")
    rating = Faker("pyfloat", min_value=0.0, max_value=5.0, right_digits=1)

    easy_apply = Faker("boolean")
    active_hiring = Faker("boolean")

    posted_at = Sequence(lambda n: timezone.now() - timedelta(days=n))
