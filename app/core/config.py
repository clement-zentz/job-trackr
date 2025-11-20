# SPDX-License-Identifier: AGPL-3.0-or-later
# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""
    debug: bool = False

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()
