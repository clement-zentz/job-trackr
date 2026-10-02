# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/test_admin.py

import pytest
from django.contrib import admin
from django.test import RequestFactory

from apps.users.admin import UserAdmin
from apps.users.models import User
from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def user_admin_add_form_class():
    request = RequestFactory().get("/admin/users/user/add/")
    request.user = UserFactory(
        is_staff=True,
        is_superuser=True,
    )

    user_admin = UserAdmin(User, admin.site)

    return user_admin.get_form(request, obj=None)


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


@pytest.mark.parametrize("username", ["alice", "ALICE"])
def test_user_admin_add_form_rejects_duplicate_username(
    user_admin_add_form_class,
    username,
):
    UserFactory(username="alice")

    form = user_admin_add_form_class(
        data={
            "username": username,
            "usable_password": "false",
        },
    )

    assert not form.is_valid()

    errors = form.errors.as_data()["username"]

    assert any(error.code == "unique" for error in errors)


def test_user_admin_add_form_rejects_username_invalid_after_lowercasing(
    user_admin_add_form_class,
):
    form = user_admin_add_form_class(
        data={
            "username": "İpek",
            "usable_password": "false",
        },
    )

    assert not form.is_valid()

    errors = form.errors.as_data()["username"]

    assert any(error.code == "invalid" for error in errors)
