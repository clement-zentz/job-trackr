# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/urls.py

from django.urls import URLPattern, path

from apps.users.api.auth.views import (
    CsrfView,
    CurrentUserView,
    LoginView,
    LogoutView,
)

urlpatterns: list[URLPattern] = [
    path("csrf/", CsrfView.as_view(), name="auth-csrf"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
]
