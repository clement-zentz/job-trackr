#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/scripts/python/generate_fixtures.py

import logging

from job_extraction.config import Settings, get_settings
from job_extraction.extraction.email.email_alert_fetcher import EmailAlertFetcher
from job_extraction.extraction.email.parser_base import EmailParser
from job_extraction.extraction.email.parsers.indeed import IndeedParser
from job_extraction.extraction.email.parsers.linkedin import LinkedInParser
from job_extraction.testdata.generators.fixtures import FixtureGenerator
from scripts.python.script_logging import setup_logging

logger: logging.Logger = setup_logging(name=__name__)


def generate_recent_fixtures(settings: Settings):
    if not settings.DEBUG:
        raise ValueError("Fixture generation requires DEBUG=True.")

    # Ask for confirmation
    response = input(
        "This will remove all existing fixtures and regenerate them.\n"
        "Would you like to continue? (y/N): "
    )
    if response.lower() != "y":
        logger.info("❌ Fixture generation cancelled")
        return

    parsers: dict[str, EmailParser] = {
        "indeed": IndeedParser(),
        "linkedin": LinkedInParser(),
    }

    email_address = settings.EMAIL_ADDRESS
    email_password = settings.EMAIL_PASSWORD

    if not email_address or not email_password:
        raise ValueError("EMAIL_ADDRESS and EMAIL_PASSWORD must be provided")

    email_fetcher = EmailAlertFetcher(
        email_address=email_address,
        password=email_password,
    )

    generator = FixtureGenerator(
        fetcher=email_fetcher, parsers=parsers, settings=settings
    )

    generator.generate()
    logger.info("✅ Fixtures generated successfully")


def main() -> None:
    settings = get_settings()
    logger.debug("Loaded settings OK")

    generate_recent_fixtures(settings)


if __name__ == "__main__":
    main()
