#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/scripts/python/generate_api_key.py

import secrets
import string


def generate_api_key(length: int = 64) -> str:
    """
    Generate a cryptographically secure API key.
    Default length: 64 characters.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


if __name__ == "__main__":
    api_key = generate_api_key()
    print(api_key)
