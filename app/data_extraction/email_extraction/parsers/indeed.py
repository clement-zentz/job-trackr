# SPDX-License-Identifier: AGPL-3.0-or-later
# app/data_extraction/email_extraction/parsers/indeed.py

from bs4 import BeautifulSoup
from app.data_extraction.email_extraction.parser_base import EmailParser


class IndeedParser(EmailParser):
    keywords = ["python", "backend developer", "data engineer"]

    def matches(self, sender: str, subject: str) -> bool:
        """
        'Indeed <alert@indeed.com>' or regional variations.
        """
        s_sender = sender.lower()
        s_subject = subject.lower()

        return (
            "indeed" in s_sender or
            "alert@indeed.com" in s_sender
        ) and any (kw in s_subject for kw in self.keywords)

    def parse(self, html: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        jobs = []

        # Each job listing is wrapped in <tr><td>...</td></tr>
        offer_rows = soup.find_all(
            "td", 
            style=lambda s: s is not None 
            and "padding:0px 0px 32px" in s
        )

        for row in offer_rows:
            # ----- 1. Extract job URL -----
            root_a = row.find("a", href=True)
            if not root_a:
                continue

            job_url = root_a.get("href")

            # ----- 2. Extract job title -----
            title_link = row.find(
                "a", 
                style=lambda s: s is not None 
                and "font-size:16px" in s
            )

            if not title_link:
                title_link = row.find("h2")

            if not title_link:
                continue # cannot extract job without title

            title = title_link.get_text(strip=True)

            # ----- 3. Extract Company + location + Rating (optional) -----
            company = ""
            location = ""
            rating: float | None = None

            parent_tr = title_link.find_parent("tr")
            company_row = parent_tr.find_next_sibling("tr") if parent_tr else None

            texts = []
            if company_row:
                spans = company_row.find_all("span")

                texts = [
                    s.get_text(" ", strip=True) 
                    for s in spans 
                    if s.get_text(strip=True)
                ]

                if texts:
                    company = texts[0]

                if len(texts) >= 2:
                    # rating or location
                    second = texts[1]
                    try:
                        rating = float(second.replace(",", "."))
                        if len(texts) >= 3:
                            location = texts[2].lstrip("- ").strip()
                    except ValueError:
                        location = second.lstrip("- ").strip()

            # if len(texts) >= 3 and not location:
            #     last = texts[-1]
            #     if "-" in last:
            #         location = last.lstrip("- ").strip()

            # fallback location extraction
            if not location:
                for td in row.find_all("td"):
                    txt = td.get_text(strip=True)
                    # detect location pattern, like "Paris (75)"
                    if "(" in txt and ")" in txt:
                        location = txt
                        break

            # ----- 4. Extract Salary (optional) -----
            salary = ""
            salary_row = company_row.find_next_sibling("tr") if company_row else None
            if salary_row:
                # Salary is plain text inside the <td>
                text = salary_row.get_text(" ", strip=True)
                # Heuristic: contains numbers + € or "$"
                if "€" in text or "$" in text:
                    salary = text

            # ----- 5. Extract Summary -----
            summary = ""
            summary_row = salary_row.find_next_sibling("tr") if salary_row else None
            if summary_row:
                summary = summary_row.get_text("", strip=True)

            if not summary:
                summary_td = row.find("td", 
                    style=lambda s: s is not None 
                    and "color:#767676" in s)
                if summary_td:
                    summary = summary_td.get_text(strip=True)

            # ----- 6. Build job dict -----
            jobs.append(
                {
                    "title": title,
                    "company": company,
                    "location": location,
                    "salary": salary,
                    "summary": summary,
                    "rating": rating,
                    "url": job_url,
                    "platform": "indeed",
                }
            )

        return jobs
