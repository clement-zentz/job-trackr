# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/services/fingerprint.py

import hashlib
import json


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
    - `None` values are preserved (serialized as `null`) and affect the fingerprint
    - Empty strings are preserved and affect fingerprint
    - Uses unambiguous JSON encoding to avoid delimiter collisions
    """
    payload = [
        platform,
        job_key,
        canonical_url,
        title.lower(),
        company.lower(),
    ]

    base = json.dumps(
        payload,
        separators=(",", ":"),
        ensure_ascii=False,
    )

    return hashlib.sha256(base.encode("utf-8")).hexdigest()
