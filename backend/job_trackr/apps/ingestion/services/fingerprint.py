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
    base = "|".join(
        filter(
            None,
            [
                platform,
                job_key,
                canonical_url,
                title.lower(),
                company.lower(),
            ],
        )
    )
    return hashlib.sha256(base.encode("utf-8")).hexdigest()
