# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin[User]):
    pass
