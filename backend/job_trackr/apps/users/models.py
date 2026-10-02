# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/models.py

from typing import Any

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    def _normalize_username(self) -> None:
        if isinstance(self.username, str):
            self.username = self.username.lower()

    def full_clean(self, *args: Any, **kwargs: Any) -> None:
        self._normalize_username()
        super().full_clean(*args, **kwargs)

    def save(self, *args: Any, **kwargs: Any) -> None:
        self._normalize_username()
        super().save(*args, **kwargs)
