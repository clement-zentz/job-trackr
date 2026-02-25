# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/common/normalization.py

import re
import unicodedata
from urllib.parse import urlparse, urlunparse


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None

    # Remove leading and trailing whitespaces
    value = value.strip()

    # Convert to lowercase
    value = value.lower()

    # Normalize accents (é → e)
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")

    # Collapse whitespace to single space
    value = re.sub(r"\s+", " ", value)

    # Keep only semantic punctuation and symbols
    value = re.sub(r"[^\w\s+#./&-]", "", value)

    # Empty string and None produce same result
    if value == "":
        return None

    return value


def normalize_url(value: str | None) -> str | None:
    if value is None:
        return None

    value = value.strip()
    if not value:
        return None

    parsed = urlparse(value)

    # Normalize scheme + netloc to lowercase
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()

    # Remove trailing slash from path
    path = parsed.path.rstrip("/")

    normalized = parsed._replace(
        scheme=scheme,
        netloc=netloc,
        path=path,
    )

    return urlunparse(normalized)
