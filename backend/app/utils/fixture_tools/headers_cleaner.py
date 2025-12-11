# backend/app/utils/fixture_tools/headers_cleaner.py

import re
from app.core.config import get_settings

settings = get_settings()


def build_name_pattern():
    parts = []

    if settings.user_first_name:
        parts.append(re.escape(settings.user_first_name.strip()))

    if settings.user_last_name:
        parts.append(re.escape(settings.user_last_name.strip()))

    if not parts:
        return None

    # Matches: Foo Bar, any case
    pattern = r"\b(" + "|".join(parts) + r")\b"
    return re.compile(pattern, flags=re.IGNORECASE)

def build_email_pattern():
    if not settings.user_email:
        return None
    
    email = re.escape(settings.user_email)

    # Matches:
    # - youremail@example.com
    # - <youremail@example.com>
    # - URL encoded: youremail%40example.com
    pattern = (
        r"(" + email + r"|<" + email + r">" + r"|" + 
        email.replace("@", r"%40") + r")")

    return re.compile(pattern, flags=re.IGNORECASE)

def clean_headers(raw: dict[str, str]) -> dict[str, str]:
    """
    Clean email metadata extracted from IMAP.
    Keeps only safe and relevant fiels while removing:
    - personal data (emails, names)
    - server routing headers (Received, ARC, SPF, DKIM...)
    - tracking IDs
    - unsubscribe URLs (contain identifiers)
    """

    # 1. Whitelist of useful & safe headers
    allowed_keys = {
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

    cleaned = {}

    for key, value in raw.items():
        k = key.lower().strip()

        # Skip anything not in the whitelist
        if k not in allowed_keys:
            continue

        if value:
            # 2.  Remove personal data if it appears inside values
            name_re = build_name_pattern()
            email_re = build_email_pattern()

            # Remove first name and last name
            if name_re:
                v = name_re.sub("", value)
            # Remove email
            if email_re:
                v = email_re.sub("", value)
        else:
            v = value
         
        # 3. Normalize content-type (remove boundaries)
        if k == "content-type":
            # Example: multipart/alternative; boundary="XYZ"
            v = v.split(";")[0].strip()
        
        cleaned[k] = v

    return cleaned
