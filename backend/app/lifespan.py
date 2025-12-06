# SPDX-License-Identifier: AGPL-3.0-or-later
# app/lifespan.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from .core.logging import setup_logging

from app.core.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()

    # Startup
    await init_db()
    yield
    # Shutdown (optional)
    await close_db()
