# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_trackr/ingestion/services/test_fingerprint.py

from apps.ingestion.services.fingerprint import compute_fingerprint


def test_same_inputs_produce_same_fingerprint():
    fp1 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="Paris",
    )

    fp2 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="Paris",
    )

    assert fp1 == fp2


def test_different_inputs_produce_different_fingerprints():
    fp1 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="London",
    )

    fp2 = compute_fingerprint(
        platform="indeed",
        job_key="124",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="Dublin",
    )

    assert fp1 != fp2


def test_title_and_company_are_case_insensitive():
    fp_lower = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="software engineer",
        company="acme",
        location="Paris",
    )

    fp_upper = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="Paris",
    )

    assert fp_lower == fp_upper


def test_none_and_empty_string_are_equivalent():
    fp_none = compute_fingerprint(
        platform="indeed",
        job_key=None,
        canonical_url=None,
        title="Software Engineer",
        company="ACME",
        location=None,
    )

    fp_empty = compute_fingerprint(
        platform="indeed",
        job_key="",
        canonical_url="",
        title="Software Engineer",
        company="ACME",
        location="",
    )

    assert fp_none == fp_empty


def test_optional_fields_combinations_affect_fingerprint():
    fp_with_job_key = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url=None,
        title="Software Engineer",
        company="ACME",
        location=None,
    )

    fp_with_url = compute_fingerprint(
        platform="indeed",
        job_key=None,
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location=None,
    )

    assert fp_with_job_key != fp_with_url


def test_url_normalization_equivalence():
    fp1 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="HTTPS://Example.com/job/1/",
        title="Software Engineer",
        company="ACME",
        location="Paris",
    )

    fp2 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
        location="Paris",
    )

    assert fp1 == fp2
