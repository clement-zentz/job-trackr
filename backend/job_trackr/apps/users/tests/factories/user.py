# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/factories/user.py

from factory.declarations import Sequence
from factory.django import DjangoModelFactory

from apps.users.models import User


class UserFactory(DjangoModelFactory[User]):
    class Meta:
        model = User

    username = Sequence(lambda n: f"user{n}")
    email = Sequence(lambda n: f"user{n}@example.com")
