# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/auth/tests/test_account_adapter.py

import json
from types import SimpleNamespace
from typing import Any, cast

import pytest
from allauth.account.adapter import DefaultAccountAdapter, get_adapter
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.headless.constants import Client
from allauth.headless.internal.decorators import mark_request_as_headless
from django import forms
from django.db import IntegrityError
from django.test import RequestFactory
from rest_framework import status

from apps.users.auth.adapters import AccountAdapter
from apps.users.models import User
from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


class SignupForm(forms.Form):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField()


@pytest.fixture
def signup_request():
    request = RequestFactory().post("/signup/")

    cast(Any, request).allauth = SimpleNamespace()
    mark_request_as_headless(request, client=Client.BROWSER)

    return request


def make_signup_form(
    *,
    username: str = "NewUser",
) -> SignupForm:
    form = SignupForm(
        data={
            "username": username,
            "email": "new-user@example.com",
            "password": "Test-password-123!",
        }
    )

    assert form.is_valid()

    return form


def test_save_user_normalizes_username_before_saving(signup_request):
    form = make_signup_form(username="MixedCaseUser")
    user = User()

    saved_user = AccountAdapter().save_user(
        signup_request,
        user,
        form,
    )

    assert form.cleaned_data["username"] == "mixedcaseuser"
    assert saved_user.username == "mixedcaseuser"


def test_save_user_translates_username_integrity_error(
    signup_request,
):
    form = make_signup_form(username="ExistingUser")

    # Simulate another signup_request claiming the username after
    # signup validation but before this user's database write.
    UserFactory(username="existinguser")

    user = User()

    with pytest.raises(ImmediateHttpResponse) as exc_info:
        AccountAdapter().save_user(
            signup_request,
            user,
            form,
        )

    response = exc_info.value.response

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    body = json.loads(response.content)

    error = body["errors"][0]

    assert len(body["errors"]) == 1
    assert error["code"] == "username_taken"
    assert error["param"] == "username"

    assert User.objects.filter(username="existinguser").count() == 1
    assert user.pk is None


def test_save_user_reraises_unrelated_integrity_error(
    signup_request,
    monkeypatch,
):
    form = make_signup_form(username="available-user")
    user = User()

    integrity_error = IntegrityError("unrelated constraint violation")

    def raise_integrity_error(*args, **kwargs):
        raise integrity_error

    monkeypatch.setattr(
        DefaultAccountAdapter,
        "save_user",
        raise_integrity_error,
    )

    with pytest.raises(IntegrityError) as exc_info:
        AccountAdapter().save_user(
            signup_request,
            user,
            form,
        )

    assert exc_info.value is integrity_error


def test_custom_account_adapter_is_configured():
    assert isinstance(get_adapter(), AccountAdapter)


def test_save_user_rejects_username_exceeding_max_length_after_normalization(
    signup_request,
):
    form = make_signup_form(username="İ" * 150)
    user = User()

    with pytest.raises(ImmediateHttpResponse) as exc_info:
        AccountAdapter().save_user(
            signup_request,
            user,
            form,
        )

    response = exc_info.value.response

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    body = json.loads(response.content)

    error = body["errors"][0]

    assert len(body["errors"]) == 1
    assert error["code"] == "max_length"
    assert error["param"] == "username"

    assert user.pk is None


def test_save_user_rejects_username_invalid_after_normalization(
    signup_request,
):
    form = make_signup_form(username="İpek")
    user = User()

    with pytest.raises(ImmediateHttpResponse) as exc_info:
        AccountAdapter().save_user(
            signup_request,
            user,
            form,
        )

    response = exc_info.value.response

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    body = json.loads(response.content)
    error = body["errors"][0]

    assert len(body["errors"]) == 1
    assert error["code"] == "invalid"
    assert error["param"] == "username"

    assert user.pk is None
