# app/config.py
import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "JobAI Agent"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"


settings = Settings()
