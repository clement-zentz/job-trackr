# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/urls.py

from django.urls import URLPattern, path

from apps.users.api.views import UserAccountView

urlpatterns: list[URLPattern] = [
    path(
        "",
        UserAccountView.as_view(),
        name="user-account",
    ),
]
