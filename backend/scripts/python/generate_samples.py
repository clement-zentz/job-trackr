# SPDX-License-Identifier: AGPL-3.0-or-later
# backend/scripts/python/generate_samples.py

from app.extraction.email.email_alert_fetcher import EmailAlertFetcher
from app.generators.samples import SampleGenerator
from app.extraction.email.parser_base import EmailParser
from app.extraction.email.parsers import indeed, linkedin
from app.core.config import get_settings

settings = get_settings()

def generate_recent_samples():
    parsers: dict[str, EmailParser] = {
        "indeed": indeed.IndeedParser(),
        "linkedin": linkedin.LinkedInParser(),
    }

    email_address = settings.email_address
    email_password = settings.email_password

    email_fetcher = EmailAlertFetcher(email_address=email_address, password=email_password)

    generator = SampleGenerator(fetcher=email_fetcher, parsers=parsers)

    generator.generate()

if __name__ == "__main__":
    generate_recent_samples()