# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/services/fingerprint.py

import hashlib
import json

from apps.common.normalization import normalize_text, normalize_url


def compute_fingerprint(
    *,
    platform: str,
    job_key: str | None,
    canonical_url: str | None,
    title: str,
    company: str,
    location: str | None,
) -> str:
    """
    Compute a stable, deterministic fingerprint for job deduplication.

    - Text fields are normalized via normalize_text
    - URL fiels are normalized via normalize_url
    - None and empty strings are treated equivalently for all fields
    - Uses unambiguous JSON encoding to avoid delimiter collisions
    """

    payload = [
        normalize_text(platform),
        normalize_text(job_key),
        normalize_url(canonical_url),
        normalize_text(title),
        normalize_text(company),
        normalize_text(location),
    ]

    base = json.dumps(
        payload,
        separators=(",", ":"),
        ensure_ascii=False,
    )

    return hashlib.sha256(base.encode("utf-8")).hexdigest()
