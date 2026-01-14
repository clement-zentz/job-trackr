# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/core/config.py

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    debug: bool = False
    fixture_dir: str
    sample_dir: str
    user_first_name: str
    user_last_name: str
    email_address: str
    email_password: str
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
