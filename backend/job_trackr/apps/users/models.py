# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/models.py

from typing import Any

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    def full_clean(self, *args: Any, **kwargs: Any) -> None:
        self.username = self.username.lower()
        super().full_clean(*args, **kwargs)

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.username = self.username.lower()
        super().save(*args, **kwargs)
