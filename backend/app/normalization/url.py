# SPDX-License-Identifier: AGPL-3.0-or-later
# backend/app/normalization/raw_url.py

import re


def normalize_job_url(raw_url: str) -> tuple[str, str] | None:
    """
    Normalize a raw job posting URL from supported platforms.

    This function extracts a unique job identifier and constructs a canonical URL
    for job postings from Indeed and LinkedIn. If the URL does not match a supported
    pattern, None is returned.

    Args:
        raw_url: The raw URL string to normalize.

    Returns:
        A tuple (job_key, canonical_url) if the URL matches a supported platform,
        where:
            - job_key: The unique job identifier extracted from the URL.
            - canonical_url: The normalized, canonical URL for the job posting.
        Returns None if the URL does not match a supported pattern.
    """
    # --- Indeed ---
    if "indeed.com" in raw_url:
        match = re.search(r"jk=([\w]+)", raw_url)
        if match:
            job_key = match.group(1)
            canonical_url = f"https://indeed.com/viewjob?jk={match.group(1)}"
            return job_key, canonical_url

    # --- LinkedIn ---
    if "linkedin.com" in raw_url:
        match = re.search(r"/jobs/view/(\d+)", raw_url)
        if match:
            job_key = match.group(1)
            canonical_url = f"https://www.linkedin.com/jobs/view/{match.group(1)}"
            return job_key, canonical_url

    return None