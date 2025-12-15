# SPDX-License-Identifier: AGPL-3.0-or-later
# backend/app/normalization/headers.py

import re
from app.core.config import get_settings

settings = get_settings()


def clean_headers(
        raw: dict[str, str],
        name_re: re.Pattern[str] | None,
        email_re: re.Pattern[str] | None,
) -> dict[str, str]:
    """
    Clean email metadata extracted from IMAP.
    Keeps only safe and relevant fields while removing:
    - personal data (emails, names)
    - server routing headers (Received, ARC, SPF, DKIM...)
    - tracking IDs
    - unsubscribe URLs (contain identifiers)
    """

    # 1. Whitelist of useful & safe headers
    ALLOWED_KEYS = {
        "from",
        "subject",
        "date",
        "message-id",
        "mime-version",
        "content-type",

        # Indeed-specific
        "preheader",
        "x-indeed-content-type",
        "x-indeed-client-app",
        "x-campaign-id",

        # Linkedin-specific
        "x-linkedin-class",
        "x-linkedin-template",
    }

    cleaned: dict[str, str] = {}

    for key, value in raw.items():
        k = key.lower().strip()

        # Skip anything not in the whitelist
        if k not in ALLOWED_KEYS:
            continue

        v = value or ""

        # Remove personal data
        if name_re:
            v = name_re.sub("", v)
        if email_re:
            v = email_re.sub("", v)

        # 3. Normalize content-type (remove boundaries)
        if k == "content-type":
            # Example: multipart/alternative; boundary="XYZ"
            v = v.split(";", 1)[0].strip()

        cleaned[k] = v

    return cleaned
