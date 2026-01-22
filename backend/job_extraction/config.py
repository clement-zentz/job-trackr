# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/config.py

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool = False
    fixture_dir: str
    sample_dir: str
    user_first_name: str
    user_last_name: str
    email_address: str
    email_password: str

    model_config = {
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


# settings = get_settings()
