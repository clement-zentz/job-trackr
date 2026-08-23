# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/demo_data/user.py

from factory.declarations import Sequence
from factory.django import DjangoModelFactory, Password

from apps.common.demo_data.constants import DEMO_PASSWORD, DEMO_USERNAME_PREFIX
from apps.users.models import User


class DemoUserFactory(DjangoModelFactory[User]):
    class Meta:
        model = User

    username = Sequence(lambda n: f"{DEMO_USERNAME_PREFIX}{n}")
    first_name = Sequence(lambda n: f"Demo {n + 1}")
    last_name = "User"
    email = Sequence(lambda n: f"{DEMO_USERNAME_PREFIX}{n}@example.com")
    password = Password(DEMO_PASSWORD)
