# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/tests/unit/job_trackr/jobs/services/test_opportunity_identity.py

from apps.jobs.services import opportunity_identity
from apps.jobs.services.opportunity_identity import compute_opportunity_key


def test_opportunity_key_is_deterministic():
    key1 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="Paris",
    )
    key2 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="Paris",
    )

    assert key1 == key2


def test_opportunity_key_case_insensitive():
    key1 = compute_opportunity_key(
        title="Backend Engineer", company="ACME", location="Paris"
    )
    key2 = compute_opportunity_key(
        title="backend engineer",
        company="acme",
        location="paris",
    )

    assert key1 == key2


def test_opportunity_key_whitespace_insensitive():
    key1 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="Paris",
    )
    key2 = compute_opportunity_key(
        title="Backend  Engineer",
        company=" ACME ",
        location=" Paris ",
    )

    assert key1 == key2


def test_opportunity_key_none_and_empty_location_equivalent():
    key1 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location=None,
    )
    key2 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="",
    )

    assert key1 == key2


def test_opportunity_key_differs_when_title_differs():
    key1 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="Paris",
    )
    key2 = compute_opportunity_key(
        title="Frontend Engineer",
        company="ACME",
        location="Paris",
    )

    assert key1 != key2


def test_opportunity_key_version_affects_hash(monkeypatch):
    key_v1 = compute_opportunity_key(
        title="Backend Engineer", company="ACME", location="Paris"
    )

    monkeypatch.setattr(
        opportunity_identity,
        "OPPORTUNITY_KEY_VERSION",
        999,
    )

    key_v2 = compute_opportunity_key(
        title="Backend Engineer",
        company="ACME",
        location="Paris",
    )

    assert key_v1 != key_v2
