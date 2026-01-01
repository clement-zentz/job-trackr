# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/lifespan.py
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import close_db, init_db

from .core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()

    # Startup
    await init_db()
    yield
    # Shutdown (optional)
    await close_db()
