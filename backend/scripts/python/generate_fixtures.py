# SPDX-License-Identifier: AGPL-3.0-or-later
# scripts/python/generate_fixtures.py

from app.extraction.email.parser_base import EmailParser
from app.extraction.email.parsers.indeed import IndeedParser
from app.extraction.email.parsers.linkedin import LinkedInParser
from app.generators.fixtures import FixtureGenerator
from app.extraction.email.email_alert_fetcher import EmailAlertFetcher
from app.core.config import get_settings

settings = get_settings()

import logging

logger = logging.getLogger(__name__)

def generate_recent_fixtures():
    parsers: dict[str, EmailParser] = {
        "indeed": IndeedParser(),
        "linkedin": LinkedInParser(),
    }

    email_address = settings.email_address
    email_password = settings.email_password

    email_fetcher = EmailAlertFetcher(email_address=email_address, password=email_password)

    generator = FixtureGenerator(fetcher=email_fetcher, parsers=parsers)

    generator.generate()

if __name__ == "__main__":
    generate_recent_fixtures()

