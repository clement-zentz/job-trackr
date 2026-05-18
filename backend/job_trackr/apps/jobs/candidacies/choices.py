# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/candidacies/choices.py

from django.db import models


class CandidacyStatus(models.TextChoices):
    APPLIED = "applied", "Applied"
    INTERVIEW = "interview", "Interview"
    TECHNICAL_TEST = "technical_test", "Technical test"
    OFFER = "offer", "Offer"
    REJECTED = "rejected", "Rejected"
    WITHDRAWN = "withdrawn", "Withdrawn"
