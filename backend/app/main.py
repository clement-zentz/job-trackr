# SPDX-License-Identifier: AGPL-3.0-or-later
# app/main.py
from fastapi import FastAPI

import app.models  # noqa
from app.api import job_applications, job_offers
from app.lifespan import lifespan

app = FastAPI(title="JobAI Agent", lifespan=lifespan)

# Include routes
app.include_router(job_applications.router)
app.include_router(job_offers.router)
