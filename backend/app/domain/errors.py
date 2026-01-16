# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/app/domain/errors.py

from uuid import UUID


class DomainError(RuntimeError):
    """Base class for domain errors."""


class JobOpportunityNotFound(DomainError):
    def __init__(self, job_opportunity_id: UUID) -> None:
        self.job_opportunity_id = job_opportunity_id
        super().__init__(f"JobOpportunity {job_opportunity_id} not found")
