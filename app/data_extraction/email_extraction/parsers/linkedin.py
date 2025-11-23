# SPDX-License-Identifier: AGPL-3.0-or-later
# app/extraction/parsers/linkedin.py

from bs4 import BeautifulSoup
from app.data_extraction.email_extraction.parser_base import EmailParser


class LinkedInParser(EmailParser):
    keywords = ["python", "backend developer", "data engineer"]

    def matches(self, sender: str, subject: str) -> bool:
        """
        Match Linkedin job alerts like:
        - Alertes LinkedIn Jo. () <jobalerts-noreply@linkedin.com>
        """
        s_sender = sender.lower()
        s_subject = subject.lower()

        return (
            "linkedin" in s_sender or 
            "jobalerts-noreply@linkedin.com" in s_sender
        ) and any (kw in s_subject for kw in self.keywords)

    def parse(self, html: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        jobs = []

        # 1. Find all job title links on reliable inline styles
        title_links = soup.find_all(
            "a",
            style=lambda s: s is not None
            and "font-size: 16px" in s
            and "line-height: 1.25" in s,
        )

        for a in title_links:
            title = a.get_text(strip=True)
            url = a.get("href")

            if not title:
                continue

            # 2. Company + location are in the next <p> sibling
            company = ""
            location = ""

            # Move to the next p tag after a
            next_p = a.find_next("p")

            if next_p:
                text = next_p.get_text(" ", strip=True)
                # "Company name · Location"
                if "." in text:
                    company, location = [x.strip() for x in text.split("·", 1)]
                else:
                    company = text

            jobs.append(
                {
                    "title": title,
                    "company": company,
                    "location": location,
                    "url": url,
                    "platform": "linkedin",
                }
            )

        return jobs
