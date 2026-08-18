# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/tests/test_auth_api.py

import pytest
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User

pytestmark = pytest.mark.django_db


@pytest.fixture
def user() -> User:
    return User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="testpass123",
    )


@pytest.fixture
def csrf_client() -> APIClient:
    return APIClient(enforce_csrf_checks=True)


def get_csrf_token(client: APIClient) -> str:
    response = client.get(reverse("auth-csrf"))

    assert response.status_code == status.HTTP_204_NO_CONTENT

    return client.cookies[settings.CSRF_COOKIE_NAME].value


def test_csrf_sets_csrf_cookie(csrf_client: APIClient):
    response = csrf_client.get(reverse("auth-csrf"))

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert settings.CSRF_COOKIE_NAME in csrf_client.cookies


def test_login_creates_session(
    csrf_client: APIClient,
    user: User,
):
    csrf_token = get_csrf_token(csrf_client)

    response = csrf_client.post(
        reverse("auth-login"),
        {
            "username": user.username,
            "password": "testpass123",
        },
        format="json",
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == user.pk
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email
    assert settings.SESSION_COOKIE_NAME in csrf_client.cookies


def test_login_rejects_invalid_credentials(
    csrf_client: APIClient,
    user: User,
):
    csrf_token = get_csrf_token(csrf_client)

    response = csrf_client.post(
        reverse("auth-login"),
        {
            "username": user.username,
            "password": "wrong-password",
        },
        format="json",
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data == {"non_field_errors": ["Invalid username or password."]}


def test_login_requires_csrf(
    csrf_client: APIClient,
    user: User,
):
    get_csrf_token(csrf_client)

    response = csrf_client.post(
        reverse("auth-login"),
        {
            "username": user.username,
            "password": "testpass123",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_current_user(
    csrf_client: APIClient,
    user: User,
):
    csrf_token = get_csrf_token(csrf_client)

    login_response = csrf_client.post(
        reverse("auth-login"),
        {
            "username": user.username,
            "password": "testpass123",
        },
        format="json",
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert login_response.status_code == status.HTTP_200_OK

    response = csrf_client.get(reverse("auth-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "id": user.pk,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


def test_get_current_user_requires_authentication(
    csrf_client: APIClient,
):
    response = csrf_client.get(reverse("auth-me"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_logout_clears_session(
    csrf_client: APIClient,
    user: User,
):
    csrf_token = get_csrf_token(csrf_client)

    login_response = csrf_client.post(
        reverse("auth-login"),
        {
            "username": user.username,
            "password": "testpass123",
        },
        format="json",
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert login_response.status_code == status.HTTP_200_OK

    # Django rotates the CSRF secret when logging in, so use the new cookie.
    csrf_token = csrf_client.cookies[settings.CSRF_COOKIE_NAME].value

    response = csrf_client.post(
        reverse("auth-logout"),
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    me_response = csrf_client.get(reverse("auth-me"))

    assert me_response.status_code == status.HTTP_403_FORBIDDEN


def test_logout_requires_authentication(
    csrf_client: APIClient,
):
    csrf_token = get_csrf_token(csrf_client)

    response = csrf_client.post(
        reverse("auth-logout"),
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_reverse_auth_urls():
    assert reverse("auth-csrf") == "/api/v1/auth/csrf/"
    assert reverse("auth-login") == "/api/v1/auth/login/"
    assert reverse("auth-logout") == "/api/v1/auth/logout/"
    assert reverse("auth-me") == "/api/v1/auth/me/"
