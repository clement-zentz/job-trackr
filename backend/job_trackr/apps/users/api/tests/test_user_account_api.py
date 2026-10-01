# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/tests/test_user_account_api.py

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.tests.factories.user import UserFactory

pytestmark = pytest.mark.django_db


USER_ACCOUNT_KEYS = {
    "id",
    "username",
    "email",
    "first_name",
    "last_name",
    "date_joined",
}


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user():
    return UserFactory(
        username="testuser",
        email="testuser@example.com",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_login(user=user)
    return api_client


@pytest.fixture
def account_url():
    return reverse("user-account")


def test_retrieve_user_account(
    authenticated_client,
    account_url,
    user,
):
    response = authenticated_client.get(account_url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data.keys() == USER_ACCOUNT_KEYS

    assert response.data["id"] == user.id
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email
    assert response.data["first_name"] == user.first_name
    assert response.data["last_name"] == user.last_name
    assert response.data["date_joined"] is not None


def test_retrieve_user_account_requires_authentication(
    api_client,
    account_url,
):
    response = api_client.get(account_url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_update_user_account_requires_authentication(
    api_client,
    account_url,
):
    response = api_client.patch(
        account_url,
        {
            "first_name": "Updated",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_partial_update_user_account(
    authenticated_client,
    account_url,
    user,
):
    original_email = user.email

    response = authenticated_client.patch(
        account_url,
        {
            "username": "Updated-User",
            "first_name": "Updated",
            "last_name": "Name",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data.keys() == USER_ACCOUNT_KEYS

    user.refresh_from_db()

    assert user.username == "updated-user"
    assert user.first_name == "Updated"
    assert user.last_name == "Name"
    assert user.email == original_email

    assert response.data["username"] == "updated-user"
    assert response.data["first_name"] == "Updated"
    assert response.data["last_name"] == "Name"


def test_partial_update_preserves_unspecified_fields(
    authenticated_client,
    account_url,
    user,
):
    original_username = user.username
    original_email = user.email
    original_last_name = user.last_name

    response = authenticated_client.patch(
        account_url,
        {
            "first_name": "Updated",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    user.refresh_from_db()

    assert user.first_name == "Updated"
    assert user.username == original_username
    assert user.email == original_email
    assert user.last_name == original_last_name


def test_email_is_read_only(
    authenticated_client,
    account_url,
    user,
):
    original_email = user.email

    response = authenticated_client.patch(
        account_url,
        {
            "email": "new-email@example.com",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    user.refresh_from_db()

    assert user.email == original_email
    assert response.data["email"] == original_email


def test_update_rejects_case_insensitive_duplicate_username(
    authenticated_client,
    account_url,
    user,
):
    UserFactory(username="existinguser")

    response = authenticated_client.patch(
        account_url,
        {
            "username": "EXISTINGUSER",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.data

    user.refresh_from_db()

    assert user.username == "testuser"


def test_update_allows_current_username(
    authenticated_client,
    account_url,
    user,
):
    response = authenticated_client.patch(
        account_url,
        {
            "username": user.username,
            "first_name": "Updated",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    user.refresh_from_db()

    assert user.username == "testuser"
    assert user.first_name == "Updated"


def test_full_update_user_account_is_not_allowed(
    authenticated_client,
    account_url,
):
    response = authenticated_client.put(
        account_url,
        {
            "username": "updated-user",
            "first_name": "Updated",
            "last_name": "User",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_update_rejects_username_exceeding_max_length_after_lowercasing(
    authenticated_client,
    account_url,
    user,
):
    response = authenticated_client.patch(
        account_url,
        {
            "username": "İ" * 150,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.data
    assert response.data["username"][0].code == "max_length"

    user.refresh_from_db()

    assert user.username == "testuser"
