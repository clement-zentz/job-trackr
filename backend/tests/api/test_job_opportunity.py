# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/api/test_job_opportunity.py

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def create_job_opportunity(async_client: AsyncClient) -> dict:
    payload = {
        "title": "Backend Engineer",
        "company": "ACME",
        "location": "Remote",
        "priority": "medium",
        "notes": "Interesting role",
    }
    res = await async_client.post("/job-opportunities", json=payload)
    assert res.status_code == 201
    return res.json()


async def test_create_job_opportunity(async_client: AsyncClient):
    data = await create_job_opportunity(async_client)

    assert data["id"]
    assert data["title"] == "Backend Engineer"
    assert data["company"] == "ACME"
    assert data["is_active"] is True


async def test_update_job_opportunity(async_client: AsyncClient):
    created = await create_job_opportunity(async_client)

    res = await async_client.patch(
        f"/job-opportunities/{created['id']}",
        json={"title": "Senior Backend Engineer"},
    )
    assert res.status_code == 200

    data = res.json()
    assert data["title"] == "Senior Backend Engineer"


async def test_deactivate_job_opportunity(async_client: AsyncClient):
    created = await create_job_opportunity(async_client)

    res = await async_client.patch(f"/job-opportunities/{created['id']}/deactivate")
    assert res.status_code == 200

    data = res.json()
    assert data["is_active"] is False


async def test_get_job_opportunity(async_client: AsyncClient):
    created = await create_job_opportunity(async_client)

    res = await async_client.get(f"/job-opportunities/{created['id']}")
    assert res.status_code == 200

    data = res.json()
    assert data["id"] == created["id"]


async def test_list_job_opportunities(async_client: AsyncClient):
    await create_job_opportunity(async_client)
    await create_job_opportunity(async_client)

    res = await async_client.get("/job-opportunities")
    assert res.status_code == 200

    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2


async def test_job_opportunity_not_found(async_client: AsyncClient):
    fake_id = "00000000-0000-0000-0000-000000000000"

    res = await async_client.get(f"/job-opportunities/{fake_id}")
    assert res.status_code == 404
    assert res.json()["detail"] == "Job Opportunity not found"
