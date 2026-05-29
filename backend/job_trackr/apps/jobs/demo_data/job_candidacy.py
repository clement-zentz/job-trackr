# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/demo_data/job_candidacy.py

from factory.declarations import Iterator, SubFactory
from factory.django import DjangoModelFactory
from factory.faker import Faker

from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy

from .job_posting import DemoJobPostingFactory


class DemoJobCandidacyFactory(DjangoModelFactory[JobCandidacy]):
    class Meta:
        model = JobCandidacy

    job_posting = SubFactory(DemoJobPostingFactory)

    status = Iterator([choice for choice, _label in CandidacyStatus.choices])

    applied_on = Faker(
        "date_between",
        start_date="-30d",
        end_date="today",
    )

    notes = Faker("paragraph", nb_sentences=3)
