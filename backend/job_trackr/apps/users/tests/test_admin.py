# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/test_admin.py

import pytest
from django.contrib import admin

from apps.users.admin import UserAdmin
from apps.users.models import User
from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


def test_user_admin_rejects_duplicate_username_after_lowercasing():
    UserFactory(username="alice")
    user = UserFactory(username="bob")

    user_admin = UserAdmin(User, admin.site)
    form_class = user_admin.form

    form = form_class(
        data={
            "username": "ALICE",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
        },
        instance=user,
    )

    assert not form.is_valid()

    errors = form.errors.as_data()["username"]

    assert any(error.code == "unique" for error in errors)


def test_user_admin_rejects_username_invalid_after_lowercasing():
    user = UserFactory(username="bob")

    user_admin = UserAdmin(User, admin.site)
    form_class = user_admin.form

    form = form_class(
        data={
            "username": "İpek",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
        },
        instance=user,
    )

    assert not form.is_valid()

    errors = form.errors.as_data()["username"]

    assert any(error.code == "invalid" for error in errors)
