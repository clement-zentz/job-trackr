# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/main.py

from fastapi import FastAPI

from job_extraction.api.job_postings import router as job_postings_router

app = FastAPI(title="JobTrackr")
app.include_router(job_postings_router)
