# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/factories/job_candidacy.py

import random

from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy
from factory.declarations import LazyFunction, SubFactory
from factory.django import DjangoModelFactory
from factory.faker import Faker

from .job_posting import JobPostingFactory


class JobCandidacyFactory(DjangoModelFactory):
    class Meta:
        model = JobCandidacy

    job_posting = SubFactory(JobPostingFactory)

    status = LazyFunction(
        lambda: random.choice([choice for choice, _ in CandidacyStatus.choices])
    )

    applied_on = Faker(
        "date_between",
        start_date="-30d",
        end_date="today",
    )

    notes = Faker("paragraph", nb_sentences=3)
