# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/services/opportunity_identity.py

import hashlib
import json

from apps.common.normalization import normalize_text

OPPORTUNITY_KEY_VERSION = 1


def compute_opportunity_key(
    *,
    title: str,
    company: str,
    location: str | None,
) -> str:
    """
    Compute a stable deterministic key for grouping
    multiple JobPostings into one JobOpportunity.

    Semantics:
    - Case/whitespace/punctuation-insensitive via normalize_text
    - Missing location values are treated consistently via normalize_text
    - Uses JSON encoding to avoid delimiter collisions

    Versioned to allow future evolution.
    """

    payload = [
        OPPORTUNITY_KEY_VERSION,
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
