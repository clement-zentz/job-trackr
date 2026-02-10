# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_extraction/services/django_client.py

import httpx

from job_extraction.schemas.extracted_jobs import JobPostingResponse


class DjangoIngestionClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: int = 30,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    async def ingest_job_postings(
        self,
        jobs: list[JobPostingResponse],
    ) -> None:
        url = f"{self.base_url}/api/v1/ingest/job-postings/"

        headers = {
            "X-Ingestion-Api-Key": self.api_key,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                json=[job.model_dump(mode="json") for job in jobs],
                headers=headers,
            )
            response.raise_for_status()
