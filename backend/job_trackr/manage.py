#!/usr/bin/env python
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/manage.py

"""Django's command-line utility for administrative tasks."""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Only load .env file when explicitly requested via USE_DOTENV=1
# This prevents surprising config precedence in CI/prod and preserves
# strict env validation for production deployments.
if os.environ.get("USE_DOTENV") == "1":
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / "env" / "job-trackr" / ".env")


def main():
    """Run administrative tasks."""
    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        "job_trackr.settings.dev",
    )
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
