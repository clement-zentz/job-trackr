# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/testdata/samples/writer.py

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
from job_extraction.normalization.url.sanitize import sanitize_job_url
from job_extraction.testdata.fixtures.naming import format_fixture_date


def _json_safe(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Path):
        return str(obj)
    return obj


def serialize_jobs(jobs: list[dict], platform: str) -> str:
    return json.dumps(
        {
            "platform": platform,
            "count": len(jobs),
            "jobs": jobs,
        },
        indent=2,
        ensure_ascii=False,
        default=_json_safe,
    )


def create_sample(
    platform: str,
    html: str,
    headers: dict,
    jobs: list[dict],
    uid: int,
    settings: Settings,
    msg_date: datetime | None = None,
):
    """
    Generate samples with extracted email:
    - body_raw.html, body_struct.html, body_sanitized.html
    - headers_raw.json, headers_sanitized.json
    - jobs_raw.json, jobs_sanitized.json
    """
    if not settings.DEBUG:
        return  # no fixture generation in production

    name_re = build_name_pattern(settings=settings)
    email_re = build_email_pattern(settings=settings)

    msg_date = msg_date or datetime.now(UTC)
    date_str = format_fixture_date(msg_date)

    sample_dir = settings.SAMPLE_DIR

    if not sample_dir:
        raise ValueError("SAMPLE_DIR is required")

    sample_path = Path(sample_dir) / platform / f"{date_str}_{uid}"
    sample_path.mkdir(parents=True, exist_ok=True)

    # --- Body raw ---
    body_raw_path = sample_path / "body_raw.html"
    body_raw_path.write_text(html, encoding="utf-8")

    # --- Body struct ---
    body_structured_soup = strip_structure(html)
    body_struct_path = sample_path / "body_struct_.html"
    body_struct_path.write_text(body_structured_soup.prettify(), encoding="utf-8")

    # --- Body sanitized ---
    body_sanitized_soup = strip_structure(html)
    redact_pii(body_sanitized_soup, name_re, email_re)
    body_sanitized_path = sample_path / "body_sanitized_.html"
    body_sanitized_path.write_text(body_sanitized_soup.prettify(), encoding="utf-8")

    # --- Headers raw ---
    headers_raw_path = sample_path / "headers_raw.json"
    headers_raw_path.write_text(json.dumps(headers, indent=2))

    # --- Headers sanitized ---
    headers_sanitized = redact_headers(whitelist_headers(headers), name_re, email_re)
    headers_sanitized_path = sample_path / "headers_sanitized.json"
    headers_sanitized_path.write_text(json.dumps(headers_sanitized, indent=2))

    # --- Jobs raw ---
    if jobs is not None:
        jobs_raw_path = sample_path / "jobs_raw.json"
        jobs_raw_path.write_text(
            serialize_jobs(jobs, platform),
            encoding="utf-8",
        )

    # --- Jobs sanitized ---
    sanitized_jobs = [
        {**job, "raw_url": sanitize_job_url(job["raw_url"])} for job in jobs
    ]

    jobs_sanitized_path = sample_path / "jobs_sanitized.json"
    jobs_sanitized_path.write_text(
        serialize_jobs(sanitized_jobs, platform),
        encoding="utf-8",
    )


def remove_all_samples(settings: Settings):
    """Remove all sample files from sample directory."""
    sample_dir = settings.SAMPLE_DIR

    if not sample_dir:
        raise ValueError("SAMPLE_DIR must be provided")

    sample_path = Path(sample_dir)
    sample_path.mkdir(parents=True, exist_ok=True)

    # Remove recursively all files
    # in sample dir and subdirs
    for item in sample_path.iterdir():
        if item.is_file():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)
