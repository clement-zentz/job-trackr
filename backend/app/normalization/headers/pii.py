# backend/app/normalization/headers/pii.py

import re

def redact_headers(
        headers: dict[str, str],
        name_re: re.Pattern[str] | None,
        email_re: re.Pattern[str] | None,
) -> dict[str, str]:
    cleaned = {}
    for k, v in headers.items():
        if name_re:
            v = name_re.sub("", v)
        if email_re:
            v = email_re.sub("", v)
        cleaned[k] = v
    return cleaned
