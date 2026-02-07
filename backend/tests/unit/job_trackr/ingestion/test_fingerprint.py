# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_trackr/ingestion/test_fingerprint.py

from apps.ingestion.services.fingerprint import compute_fingerprint


def test_same_inputs_produce_same_fingerprint():
    fp1 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    fp2 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    assert fp1 == fp2


def test_different_inputs_produce_different_fingerprints():
    fp1 = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    fp2 = compute_fingerprint(
        platform="indeed",
        job_key="124",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    assert fp1 != fp2


def test_title_and_company_are_case_insensitive():
    fp_lower = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="software engineer",
        company="acme",
    )

    fp_upper = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    assert fp_lower == fp_upper


def test_none_and_empty_string_are_not_equivalent():
    fp_none = compute_fingerprint(
        platform="indeed",
        job_key=None,
        canonical_url=None,
        title="Software Engineer",
        company="ACME",
    )

    fp_empty = compute_fingerprint(
        platform="indeed",
        job_key="",
        canonical_url="",
        title="Software Engineer",
        company="ACME",
    )

    assert fp_none != fp_empty


def test_optional_fields_combinations_affect_fingerprint():
    fp_with_job_key = compute_fingerprint(
        platform="indeed",
        job_key="123",
        canonical_url=None,
        title="Software Engineer",
        company="ACME",
    )

    fp_with_url = compute_fingerprint(
        platform="indeed",
        job_key=None,
        canonical_url="https://example.com/job/1",
        title="Software Engineer",
        company="ACME",
    )

    assert fp_with_job_key != fp_with_url
