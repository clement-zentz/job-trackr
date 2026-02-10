# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/config.py

import warnings
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / "backend" / "env" / "job-extraction" / ".env"


class Settings(BaseSettings):
    DEBUG: bool = False
    FIXTURE_DIR: str
    SAMPLE_DIR: str
    USER_FIRST_NAME: str
    USER_LAST_NAME: str
    EMAIL_ADDRESS: str
    EMAIL_PASSWORD: str
    JOB_TRACKR_URL: str = "http://job-trackr:8000"
    INGESTION_API_KEY: str

    # --- Backward compatibility layer ---
    @property
    def debug(self) -> bool:
        warnings.warn(
            "`settings.debug` is deprecated, use `settings.DEBUG` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.DEBUG

    @property
    def fixture_dir(self) -> str:
        warnings.warn(
            "`settings.fixture_dir` is deprecated, use `settings.FIXTURE_DIR` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.FIXTURE_DIR

    @property
    def sample_dir(self) -> str:
        warnings.warn(
            "`settings.sample_dir` is deprecated, use `settings.SAMPLE_DIR` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.SAMPLE_DIR

    @property
    def user_first_name(self) -> str:
        warnings.warn(
            "`settings.user_first_name` is deprecated, "
            "use `settings.USER_FIRST_NAME` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.USER_FIRST_NAME

    @property
    def user_last_name(self) -> str:
        warnings.warn(
            "`settings.user_last_name` is deprecated, "
            "use `settings.USER_LAST_NAME` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.USER_LAST_NAME

    @property
    def email_address(self) -> str:
        warnings.warn(
            "`settings.email_address` is deprecated, "
            "use `settings.EMAIL_ADDRESS` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.EMAIL_ADDRESS

    @property
    def email_password(self) -> str:
        warnings.warn(
            "`settings.email_password` is deprecated, "
            "use `settings.EMAIL_PASSWORD` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.EMAIL_PASSWORD

    @property
    def job_trackr_url(self) -> str:
        warnings.warn(
            "`settings.job_trackr_url` is deprecated, "
            "use `settings.JOB_TRACKR_URL` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.JOB_TRACKR_URL

    @property
    def ingestion_api_key(self) -> str:
        warnings.warn(
            "`settings.ingestion_api_key` is deprecated, "
            "use `settings.INGESTION_API_KEY` instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.INGESTION_API_KEY

    # --- Model Config ---
    model_config = SettingsConfigDict(
        case_sensitive=False,
        extra="ignore",
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings(*, _env_file=ENV_FILE) -> Settings:
    return Settings(_env_file=_env_file)  # type: ignore[call-arg]


# settings = get_settings()
