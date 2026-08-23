# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/demo_data/job_candidacy.py

import random
from datetime import date, timedelta

from factory.declarations import Iterator, LazyAttribute, SubFactory
from factory.django import DjangoModelFactory
from factory.faker import Faker

from apps.jobs.candidacies.choices import CandidacyStatus
from apps.jobs.candidacies.models import JobCandidacy

from .job_posting import DemoJobPostingFactory


def generate_applied_on(posted_on: date) -> date:
    latest_date = min(
        posted_on + timedelta(days=7),
        date.today(),
    )
    days_after_posting = (latest_date - posted_on).days

    return posted_on + timedelta(
        days=random.randint(0, days_after_posting),
    )


class DemoJobCandidacyFactory(DjangoModelFactory[JobCandidacy]):
    class Meta:
        model = JobCandidacy

    job_posting = SubFactory(DemoJobPostingFactory)

    status = Iterator(CandidacyStatus.values)

    applied_on = LazyAttribute(
        lambda obj: generate_applied_on(obj.job_posting.posted_on)
    )

    notes = Faker("paragraph", nb_sentences=3)
