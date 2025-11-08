# tests/test.py
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_root_route():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "JobAI Agent is running 🚀"}


@pytest.mark.asyncio
async def test_apply_job_route():
    job_data = {
        "title": "Python Developer",
        "company": "OpenAI",
        "description": "Building AI agents",
        "location": "Remote",
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/jobs/apply", json=job_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["job_title"] == "Python Developer"
