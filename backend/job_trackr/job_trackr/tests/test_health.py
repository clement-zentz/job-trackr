# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/job_trackr/tests/test_health.py

from unittest.mock import patch

import pytest
from django.db import DatabaseError, OperationalError
from django.test import Client

pytestmark = pytest.mark.integration


@pytest.mark.django_db
def test_health_returns_ok_without_authentication(client, django_assert_num_queries):
    with django_assert_num_queries(1):
        response = client.get("/api/health/")

    assert response.status_code == 200
    assert response["Content-Type"] == "application/json"
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_health_supports_head_requests(client, django_assert_num_queries):
    with django_assert_num_queries(1):
        response = client.head("/api/health/")

    assert response.status_code == 200
    assert response["Content-Type"] == "application/json"
    assert response.content == b""


def test_health_returns_unavailable_when_database_connection_fails(client: Client):
    with patch(
        "job_trackr.health.connection.cursor",
        side_effect=OperationalError("Database connection failed"),
    ):
        response = client.get("/api/health/")

    assert response.status_code == 503
    assert response["Content-Type"] == "application/json"
    assert response.json() == {"status": "unavailable"}


def test_health_returns_unavailable_when_database_query_fails(client: Client):
    with patch("job_trackr.health.connection.cursor") as cursor_factory:
        cursor = cursor_factory.return_value.__enter__.return_value
        cursor.execute.side_effect = DatabaseError("Database query failed")

        response = client.get("/api/health/")

    assert response.status_code == 503
    assert response["Content-Type"] == "application/json"
    assert response.json() == {"status": "unavailable"}


def test_health_rejects_post_requests(client: Client):
    response = client.post("/api/health/")

    assert response.status_code == 405
