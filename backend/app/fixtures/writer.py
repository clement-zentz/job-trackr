# SPDX-License-Identifier: AGPL-3.0-or-later
# backend/app/fixtures/writer.py
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone, date

from app.core.config import get_settings
from app.normalization.html.structural import strip_structure
from app.normalization.html.pii import redact_pii
from app.normalization.headers.pii import redact_headers
from app.normalization.headers.whitelist import whitelist_headers
from app.normalization.pii.patterns import build_name_pattern, build_email_pattern
from .naming import format_fixture_date

settings = get_settings()


def create_fixture(
    platform: str, 
    html: str, 
    headers: dict,
    jobs: list[dict],
    uid: int,
    msg_date: datetime | None = None,
):
    """
    Generate fixture with extracted email:
    - brut fixture for tests
    - net fixture for human reader
    """
    if not settings.debug:
        return # no fixture generation in production
    
    name_re = build_name_pattern()
    email_re = build_email_pattern()

    msg_date = msg_date or datetime.now(timezone.utc)
    date_str = format_fixture_date(msg_date)

    # Raw email fixture
    fixt_dir = Path(settings.fixture_dir) / platform / f"{date_str}_{uid}"
    fixt_dir.mkdir(parents=True, exist_ok=True)
    
    sanitized_html_soup = strip_structure(html)
    redact_pii(sanitized_html_soup, name_re, email_re)
    clean_body_path = fixt_dir / f"clean_{uid}.html"
    clean_body_path.write_text(
        sanitized_html_soup.prettify(), encoding="utf-8")
    
    sanitized_headers = redact_headers(
        whitelist_headers(headers), name_re, email_re)
    net_headers_path = fixt_dir / f"net_headers_{uid}.json"
    net_headers_path.write_text(
        json.dumps(sanitized_headers, indent=2))
    
    def _json_safe(obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Path):
            return str(obj)
        return obj

    if jobs is not None:
        response_path = fixt_dir / f"response_{uid}.json"
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

def remove_all_fixtures():
    """Remove all fixture files from fixture directory."""
    fixt_dir = Path(settings.fixture_dir)

    # Remove recursively all files
    # in fixture dir and subdirs
    for item in fixt_dir.iterdir():
        if item.is_file():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)
