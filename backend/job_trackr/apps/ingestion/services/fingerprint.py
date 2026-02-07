# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/services/fingerprint.py

import hashlib


def compute_fingerprint(
    *,
    platform: str,
    job_key: str | None,
    canonical_url: str | None,
    title: str,
    company: str,
) -> str:
    """
    Compute a stable, deterministic fingerprint for job deduplication.

    - Case-insensitive for title and company
    - `None` values are excluded
    - Empty strings are preserved and affect fingerprint
    """
    parts = [
        platform,
        job_key,
        canonical_url,
        title.lower(),
        company.lower(),
    ]

    base = "|".join(part for part in parts if part is not None)

    return hashlib.sha256(base.encode("utf-8")).hexdigest()
