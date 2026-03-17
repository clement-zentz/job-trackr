# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/models.py

"""
Public models API for the `jobs` app.

This module re-exports domain models from submodules to provide a stable
import path:

    from apps.jobs.models import JobOpportunity, JobPosting

This allows internal refactoring of the domain structure without breaking
external imports (e.g., FKs, services, tests).
"""

from apps.jobs.opportunities.models import (  # noqa: F401
    JobOpportunity,
    JobOpportunityPriority,
)
from apps.jobs.postings.models import JobPosting  # noqa: F401

__all__ = [
    "JobOpportunity",
    "JobOpportunityPriority",
    "JobPosting",
]
