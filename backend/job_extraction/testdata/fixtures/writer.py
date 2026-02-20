# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/testdata/fixtures/writer.py

import json
import shutil
from datetime import UTC, date, datetime
from pathlib import Path

from job_extraction.config import Settings
from job_extraction.normalization.headers.pii import redact_headers
from job_extraction.normalization.headers.whitelist import whitelist_headers
from job_extraction.normalization.html.pii import redact_pii
from job_extraction.normalization.html.structural import strip_structure
from job_extraction.normalization.pii.patterns import (
    build_email_pattern,
    build_name_pattern,
)

from .naming import format_fixture_date


def create_fixture(
    platform: str,
    html: str,
    headers: dict,
    jobs: list[dict],
    uid: int,
    settings: Settings,
    msg_date: datetime | None = None,
):
    """
    Generate fixture with extracted email:
    - brut fixture for tests
    - net fixture for human reader
    """
    name_re = build_name_pattern(settings=settings)
    email_re = build_email_pattern(settings=settings)

    msg_date = msg_date or datetime.now(UTC)
    date_str = format_fixture_date(msg_date)

    fixture_dir = settings.FIXTURE_DIR

    if not fixture_dir:
        raise ValueError("FIXTURE_DIR must be provided")

    # Raw email fixture
    fixture_path = Path(fixture_dir) / platform / f"{date_str}_{uid}"
    fixture_path.mkdir(parents=True, exist_ok=True)

    sanitized_html_soup = strip_structure(html)
    redact_pii(sanitized_html_soup, name_re, email_re)
    clean_body_path = fixture_path / f"clean_{uid}.html"
    clean_body_path.write_text(sanitized_html_soup.prettify(), encoding="utf-8")

    sanitized_headers = redact_headers(whitelist_headers(headers), name_re, email_re)
    net_headers_path = fixture_path / f"net_headers_{uid}.json"
    net_headers_path.write_text(json.dumps(sanitized_headers, indent=2))

    def _json_safe(obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Path):
            return str(obj)
        return obj

    if jobs is not None:
        response_path = fixture_path / f"response_{uid}.json"
        response_path.write_text(
            json.dumps(
                {
                    "platform": platform,
                    "count": len(jobs),
                    "jobs": jobs,
                },
                indent=2,
                ensure_ascii=False,
                default=_json_safe,
            ),
            encoding="utf-8",
        )


def remove_all_fixtures(settings: Settings):
    """Remove all fixture files from fixture directory."""
    fixture_dir = settings.FIXTURE_DIR

    if not fixture_dir:
        raise ValueError("FIXTURE_DIR must be provided")

    fixture_path = Path(fixture_dir)

    fixture_path.mkdir(parents=True, exist_ok=True)

    # Remove recursively all files
    # in fixture dir and subdirs
    for item in fixture_path.iterdir():
        if item.is_file():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)
