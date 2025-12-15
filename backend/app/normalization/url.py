# SPDX-License-Identifier: AGPL-3.0-or-later
# backend/app/normalization/raw_url.py

import re


def clean_job_url(url: str) -> str:
    # --- Indeed ---
    if "indeed.com" in url:
        match = re.search(r"jk=([\w]+)", url)
        if match:
            return f"https://indeed.com/viewjob?jk={match.group(1)}"
        # return "[REDACTED]"

    # --- LinkedIn ---
    if "linkedin.com" in url:
        match = re.search(r"/jobs/view/(\d+)", url)
        if match:
            return f"https://www.linkedin.com/jobs/view/{match.group(1)}"
        # return "[REDACTED]"

    return url