# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/integration/job_trackr/services/test_ingestion_processor.py

import pytest
from apps.ingestion.models import IngestedJobPosting, IngestionStatus
from apps.ingestion.services.ingestion_processor import IngestionProcessor
from apps.jobs.models import JobOpportunity, JobPosting


@pytest.mark.django_db
def test_process_creates_posting_and_opportunity():
    ing = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        raw_url="https://example.com/job1",
        fingerprint="a" * 64,
        status=IngestionStatus.RECEIVED,
    )

    processor = IngestionProcessor()
    result = processor.process(ing)

    assert result.job_posting_created is True
    assert result.job_opportunity_created is True

    ing.refresh_from_db()

    assert ing.status == IngestionStatus.PROCESSED
    assert ing.processed_at is not None

    assert JobPosting.objects.count() == 1
    assert JobOpportunity.objects.count() == 1

    posting = JobPosting.objects.get()
    opportunity = JobOpportunity.objects.get()

    assert posting.job_opportunity == opportunity
    assert ing.job_posting == posting
    assert ing.job_opportunity == opportunity


@pytest.mark.django_db
def test_process_is_idempotent():
    ing = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        raw_url="https://example.com/job1",
        fingerprint="a" * 64,
        status=IngestionStatus.RECEIVED,
    )

    processor = IngestionProcessor()

    processor.process(ing)
    processor.process(ing)  # second call

    assert JobPosting.objects.count() == 1
    assert JobOpportunity.objects.count() == 1


@pytest.mark.django_db
def test_multiple_postings_group_into_one_opportunity():
    ing1 = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        raw_url="https://example.com/job1",
        fingerprint="c" * 64,
        status=IngestionStatus.RECEIVED,
    )

    ing2 = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="indeed",
        raw_url="https://example.com/job2",
        fingerprint="d" * 64,
        status=IngestionStatus.RECEIVED,
    )

    processor = IngestionProcessor()
    processor.process(ing1)
    processor.process(ing2)

    assert JobPosting.objects.count() == 2
    assert JobOpportunity.objects.count() == 1

    opportunity = JobOpportunity.objects.get()
    assert opportunity.job_postings.count() == 2


@pytest.mark.django_db
def test_postings_with_different_locations_create_separate_opportunities():
    ing1 = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        location="Montreal, Quebec",
        raw_url="https://example.com/job1",
        fingerprint="e" * 64,
        status=IngestionStatus.RECEIVED,
    )

    ing2 = IngestedJobPosting.objects.create(
        title="Bakend Engineer",
        company="ACME",
        platform="indeed",
        location="Ottawa, Ontario",
        raw_url="https://example.com/job2",
        fingerprint="f" * 64,
        status=IngestionStatus.RECEIVED,
    )

    processor = IngestionProcessor()
    processor.process(ing1)
    processor.process(ing2)

    assert JobPosting.objects.count() == 2
    assert JobOpportunity.objects.count() == 2


@pytest.mark.django_db
def test_postings_with_normalized_location_group_into_one_opportunity():
    ing1 = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="linkedin",
        location="Paris, Île-de-France",
        raw_url="https://example.com/job3",
        fingerprint="g" * 64,
        status=IngestionStatus.RECEIVED,
    )

    ing2 = IngestedJobPosting.objects.create(
        title="Backend Engineer",
        company="ACME",
        platform="indeed",
        location="paris, ile-de-france",
        raw_url="https://example.com/job4",
        fingerprint="h" * 64,
        status=IngestionStatus.RECEIVED,
    )

    processor = IngestionProcessor()
    processor.process(ing1)
    processor.process(ing2)

    assert JobPosting.objects.count() == 2
    assert JobOpportunity.objects.count() == 1

    opportunity = JobOpportunity.objects.get()
    assert opportunity.job_postings.count() == 2
