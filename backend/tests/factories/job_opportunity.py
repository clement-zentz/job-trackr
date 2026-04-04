# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/factories/job_opportunity.py

import factory
from apps.jobs.opportunities.models import JobOpportunity
from factory.declarations import Sequence
from factory.faker import Faker


class JobOpportunityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobOpportunity

    title = Sequence(lambda n: f"Backend Developer {n}")
    company = Faker("company")
    location = Faker("city")

    # opportunity_key is computed automatically on save
