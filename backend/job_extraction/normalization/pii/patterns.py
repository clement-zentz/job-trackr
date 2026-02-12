# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/normalization/pii/patterns.py

import re

from job_extraction.config import Settings


def build_name_pattern(settings: Settings) -> re.Pattern[str]:
    parts: list[str] = []

    if not settings.USER_FIRST_NAME or not settings.USER_LAST_NAME:
        raise ValueError("USER_FIRST_NAME and USER_LAST_NAME must be provided")

    parts.append(re.escape(settings.USER_FIRST_NAME.strip()))
    parts.append(re.escape(settings.USER_LAST_NAME.strip()))

    # Matches first and/or last name, case insensitive
    pattern = rf"\b({'|'.join(parts)})\b"
    return re.compile(pattern, flags=re.IGNORECASE)


def build_email_pattern(settings: Settings) -> re.Pattern[str]:
    email_address = settings.EMAIL_ADDRESS
    if not email_address:
        raise ValueError("EMAIL_ADDRESS must be provided")

    raw_email = email_address.strip()
    escaped_email = re.escape(raw_email)
    encoded_email = re.escape(raw_email.replace("@", "%40"))

    # Matches:
    # - youremail@example.com
    # - <youremail@example.com>
    # - youremail%40example.com
    pattern = rf"""
        (?:
            <{escaped_email}> |
            {escaped_email} |
            {encoded_email}
        )
    """

    return re.compile(pattern, flags=re.IGNORECASE | re.VERBOSE)
