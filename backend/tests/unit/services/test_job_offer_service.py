# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/services/test_job_offer_service.py
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.job_offer import JobOffer
from app.schemas.job_offer import JobOfferCreate, JobOfferUpdate
from app.services.job_offer import JobOfferService


# --- Setup ---
@pytest.fixture
def session():
    session = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session


@pytest.fixture
def repo():
    repo = MagicMock()
    repo.add = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_job_key = AsyncMock()
    repo.get_by_raw_url = AsyncMock()
    repo.list = AsyncMock()
    return repo


@pytest.fixture
def service(session, repo):
    return JobOfferService(
        session=session,
        repo=repo,
    )


# --- create_manual ---
@pytest.mark.asyncio
async def test_create_manual_job_offer(
    service: JobOfferService,
    repo,
    session,
):
    data = JobOfferCreate(
        title="Backend Engineer",
        company="Acme",
        platform="manual",
        raw_url="https://example.com",
    )

    result = await service.create_manual(data)

    assert isinstance(result, JobOffer)
    assert result.title == "Backend Engineer"
    assert result.company == "Acme"

    repo.add.assert_awaited_once()
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(result)


# ---- create_from_email_ingestion ---
@pytest.mark.asyncio
async def test_create_from_email_ingestion_returns_none_if_job_key_exists(
    service: JobOfferService,
    repo,
):
    repo.get_by_job_key.return_value = JobOffer(
        title="Backend Engineer",
        company="Acme",
        platform="indeed",
        job_key="abc123",
        raw_url="https://indeed.com/viewjob?jk=abc123",
    )

    data = {
        "platform": "indeed",
        "job_key": "abc123",
        "raw_url": "https://indeed.com/viewjob?jk=abc123",
    }

    result = await service.create_from_email_ingestion(data)

    repo.get_by_job_key.assert_awaited_once_with(
        platform="indeed",
        job_key="abc123",
    )

    assert result is None
    repo.get_by_job_key.assert_awaited_once()
    repo.get_by_raw_url.assert_not_called()
    repo.add.assert_not_called()


@pytest.mark.asyncio
async def test_create_from_email_ingestion_returns_none_if_raw_url_exists(
    service: JobOfferService,
    repo,
):
    repo.get_by_job_key.return_value = None
    repo.get_by_raw_url.return_value = JobOffer(
        title="Backend Engineer",
        company="Aceme",
        platform="indeed",
        raw_url="https://indeed.com/viewjob?jk=abc123",
    )

    data = {
        "platform": "indeed",
        "job_key": "abc123",
        "raw_url": "https://indeed.com/viewjob?jk=abc123",
    }

    result = await service.create_from_email_ingestion(data)

    assert result is None
    repo.get_by_job_key.assert_awaited_once()
    repo.get_by_raw_url.assert_awaited_once_with("https://indeed.com/viewjob?jk=abc123")
    repo.add.assert_not_called()


@pytest.mark.asyncio
async def test_create_from_email_ingestion_creates_job_offer(
    service: JobOfferService,
    repo,
):
    repo.get_by_job_key.return_value = None
    repo.get_by_raw_url.return_value = None

    data = {
        "title": "Backend Engineer",
        "company": "Acme",
        "location": "Paris",
        "rating": 4.2,
        "salary": "60k–70k",
        "summary": "Great role",
        "job_key": "abc123",
        "platform": "indeed",
        "raw_url": "https://indeed.com/viewjob?jk=abc123",
        "canonical_url": "https://indeed.com/jobs/abc123",
        "posted_at": None,
        "easy_apply": True,
        "active_hiring": True,
        "source": {"uid": "email-uid-42"},
    }

    result = await service.create_from_email_ingestion(data)

    assert isinstance(result, JobOffer)
    assert result.title == "Backend Engineer"
    assert result.company == "Acme"
    assert result.platform == "indeed"
    assert result.job_key == "abc123"
    assert result.raw_url == data["raw_url"]
    assert result.source_email_id == "email-uid-42"

    repo.add.assert_awaited_once_with(result)


@pytest.mark.asyncio
async def test_create_from_email_ingestion_uses_defaults(
    service: JobOfferService,
    repo,
):
    repo.get_by_job_key.return_value = None
    repo.get_by_raw_url.return_value = None

    data = {}

    result = await service.create_from_email_ingestion(data)

    assert result is not None
    assert result.title == ""
    assert result.company == ""
    assert result.platform == "unknown"
    assert result.job_key is None
    assert result.raw_url is None

    repo.add.assert_awaited_once()


# --- get_offer ---
@pytest.mark.asyncio
async def test_get_offer_returns_job_offer(
    service: JobOfferService,
    repo,
):
    job_offer = JobOffer(title="Backend", company="Acme")

    repo.get_by_id.return_value = job_offer

    result = await service.get_offer(1)

    assert result is job_offer
    repo.get_by_id.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_get_offer_raises_if_not_found(
    service: JobOfferService,
    repo,
):
    repo.get_by_id.return_value = None

    with pytest.raises(ValueError, match="Job offer not found"):
        await service.get_offer(999)


# --- list_offers ---
@pytest.mark.asyncio
async def test_list_offers_calls_repo_with_filters(
    service: JobOfferService,
    repo,
):
    expected = [JobOffer(title="Backend", company="Acme")]
    repo.list.return_value = expected

    result = await service.list_offers(
        platform="indeed",
        company="Acme",
        has_application=True,
        limit=10,
        offset=5,
    )

    assert result == expected
    repo.list.assert_awaited_once_with(
        platform="indeed",
        company="Acme",
        has_application=True,
        limit=10,
        offset=5,
    )


# --- update_offer ---
@pytest.mark.asyncio
async def test_update_offer_fields(
    service: JobOfferService,
    repo,
    session,
):
    job_offer = JobOffer(
        title="Backend",
        company="Acme",
        salary=None,
    )

    repo.get_by_id.return_value = job_offer

    data = JobOfferUpdate(
        salary="70k-80k",
    )

    result = await service.update_offer(1, data)

    assert result is job_offer
    assert job_offer.salary == "70k-80k"

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(job_offer)


@pytest.mark.asyncio
async def test_update_offer_raises_if_not_found(
    service: JobOfferService,
    repo,
):
    repo.get_by_id.return_value = None

    data = JobOfferUpdate(title="New title")

    with pytest.raises(ValueError, match="Job offer not found"):
        await service.update_offer(1, data)
