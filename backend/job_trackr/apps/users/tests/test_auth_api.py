# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/test_auth_api.py

from typing import TYPE_CHECKING, TypedDict, cast

import pytest
from allauth.account.models import EmailAddress, EmailConfirmationHMAC
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.jobs.postings.models import JobPosting

if TYPE_CHECKING:
    from apps.users.models import User


UserModel = cast(type["User"], get_user_model())


pytestmark = [
    pytest.mark.django_db,
    pytest.mark.integration,
]

PASSWORD = "Test-password-123!"


def auth_url(name: str) -> str:
    return reverse(f"headless:browser:account:{name}")


@pytest.fixture
def api_client() -> APIClient:
    return APIClient(enforce_csrf_checks=True)


@pytest.fixture
def verified_user() -> "User":
    user = UserModel.objects.create_user(  # type: ignore[attr-defined]
        username="verified-user",
        email="verified@example.com",
        password=PASSWORD,
    )
    EmailAddress.objects.create(
        user=user,
        email=user.email,
        verified=True,
        primary=True,
    )
    return user


@pytest.fixture
def unverified_user() -> "User":
    user = UserModel.objects.create_user(  # type: ignore[attr-defined]
        username="unverified-user",
        email="unverified@example.com",
        password=PASSWORD,
    )
    EmailAddress.objects.create(
        user=user,
        email=user.email,
        verified=False,
        primary=True,
    )
    return user


class CsrfHeaders(TypedDict):
    HTTP_X_CSRFTOKEN: str


def csrf_headers(api_client: APIClient) -> CsrfHeaders:
    api_client.get(auth_url("current_session"))

    csrf_token = api_client.cookies["csrftoken"].value

    return {
        "HTTP_X_CSRFTOKEN": csrf_token,
    }


def login(
    api_client: APIClient,
    *,
    username: str,
    password: str = PASSWORD,
):
    return api_client.post(
        auth_url("login"),
        {
            "username": username,
            "password": password,
        },
        format="json",
        **csrf_headers(api_client),
    )


def test_browser_login_requires_csrf(api_client, verified_user):
    response = api_client.post(
        auth_url("login"),
        {
            "username": verified_user.username,
            "password": PASSWORD,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_signup_creates_unverified_user_and_sends_verification_email(
    api_client,
):
    payload = {
        "username": "new-user",
        "email": "new-user@example.com",
        "password": PASSWORD,
    }

    response = api_client.post(
        auth_url("signup"),
        payload,
        format="json",
        **csrf_headers(api_client),
    )

    # Signup succeeded, but mandatory email verification means that
    # the user is not authenticated yet.
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["meta"]["is_authenticated"] is False

    user = UserModel.objects.get(username=payload["username"])

    assert user.email == payload["email"]
    assert user.check_password(PASSWORD)

    email_address = EmailAddress.objects.get(
        user=user,
        email=payload["email"],
    )

    assert email_address.primary is True
    assert email_address.verified is False

    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == [payload["email"]]


def test_verify_email_marks_email_address_as_verified(
    api_client,
    unverified_user,
):
    email_address = EmailAddress.objects.get(user=unverified_user)
    confirmation = EmailConfirmationHMAC.create(email_address)

    response = api_client.post(
        auth_url("verify_email"),
        {
            "key": confirmation.key,
        },
        format="json",
        **csrf_headers(api_client),
    )

    # Verification succeeds, but an anonymous verification request does
    # not itself establish an authenticated session.
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    email_address.refresh_from_db()

    assert email_address.verified is True
    assert response.json()["meta"]["is_authenticated"] is False


def test_unverified_user_cannot_complete_login(
    api_client,
    unverified_user,
):
    response = login(
        api_client,
        username=unverified_user.username,
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["meta"]["is_authenticated"] is False

    session_response = api_client.get(
        auth_url("current_session"),
    )

    assert session_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert session_response.json()["meta"]["is_authenticated"] is False


def test_login_rejects_invalid_password(
    api_client,
    verified_user,
):
    response = login(
        api_client,
        username=verified_user.username,
        password="Wrong-password-123!",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    body = response.json()

    assert body["errors"][0]["code"] == "username_password_mismatch"
    assert body["errors"][0]["param"] == "password"

    session_response = api_client.get(
        auth_url("current_session"),
    )

    assert session_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert session_response.json()["meta"]["is_authenticated"] is False


def test_login_creates_authenticated_session(
    api_client,
    verified_user,
):
    response = login(
        api_client,
        username=verified_user.username,
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["meta"]["is_authenticated"] is True
    assert response.json()["data"]["user"]["username"] == verified_user.username

    session_response = api_client.get(
        auth_url("current_session"),
    )

    assert session_response.status_code == status.HTTP_200_OK
    assert session_response.json()["meta"]["is_authenticated"] is True
    assert session_response.json()["data"]["user"]["username"] == verified_user.username


def test_logout_clears_authenticated_session(
    api_client,
    verified_user,
):
    login_response = login(
        api_client,
        username=verified_user.username,
    )

    assert login_response.status_code == status.HTTP_200_OK

    response = api_client.delete(
        auth_url("current_session"),
        **csrf_headers(api_client),
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["meta"]["is_authenticated"] is False

    session_response = api_client.get(
        auth_url("current_session"),
    )

    assert session_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert session_response.json()["meta"]["is_authenticated"] is False


def test_allauth_session_authenticates_drf_and_assigns_owner(
    api_client,
    verified_user,
):
    login_response = login(
        api_client,
        username=verified_user.username,
    )

    assert login_response.status_code == status.HTTP_200_OK

    response = api_client.post(
        reverse("job-posting-list"),
        {
            "title": "Backend Engineer",
            "company": "Example",
            "location": "Paris",
        },
        format="json",
        **csrf_headers(api_client),
    )

    assert response.status_code == status.HTTP_201_CREATED

    job_posting = JobPosting.objects.get(pk=response.data["id"])

    assert job_posting.owner == verified_user
