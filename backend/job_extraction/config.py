# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/config.py

import warnings
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / "backend" / "env" / "job-extraction" / ".env"


def _deprecated(attr: str):
    def getter(self: "Settings"):
        warnings.warn(
            f"`settings.{attr.lower()}` is deprecated, use `settings.{attr}` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return getattr(self, attr)

    return property(getter)


class Settings(BaseSettings):
    # --- Core process config ---
    DEBUG: bool = False
    INGESTION_API_KEY: str
    JOB_TRACKR_URL: str = "http://job-trackr:8000"
    # --- Optional feature config ---
    EMAIL_ADDRESS: str | None = None
    EMAIL_PASSWORD: str | None = None

    FIXTURE_DIR: str | None = None
    SAMPLE_DIR: str | None = None

    USER_FIRST_NAME: str | None = None
    USER_LAST_NAME: str | None = None

    # --- Backward compatibility layer ---
    debug = _deprecated("DEBUG")
    fixture_dir = _deprecated("FIXTURE_DIR")
    sample_dir = _deprecated("SAMPLE_DIR")
    user_first_name = _deprecated("USER_FIRST_NAME")
    user_last_name = _deprecated("USER_LAST_NAME")
    email_address = _deprecated("EMAIL_ADDRESS")
    email_password = _deprecated("EMAIL_PASSWORD")
    job_trackr_url = _deprecated("JOB_TRACKR_URL")
    ingestion_api_key = _deprecated("INGESTION_API_KEY")

    # --- Model Config ---
    model_config = SettingsConfigDict(
        case_sensitive=False,
        extra="ignore",
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
    )


@lru_cache
def _build_settings(*, _env_file=ENV_FILE) -> Settings:
    return Settings(_env_file=_env_file)  # type: ignore[call-arg]


def get_settings() -> Settings:
    return _build_settings()
