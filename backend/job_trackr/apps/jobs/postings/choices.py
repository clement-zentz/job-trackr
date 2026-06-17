# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/choices.py

from django.db import models


class Platforms(models.TextChoices):
    LINKEDIN = "linkedin", "LinkedIn"
    INDEED = "indeed", "Indeed"
    WTTJ = "wttj", "Welcome to the jungle"
    CAREER_PAGE = "career_page", "Career page"


class EmploymentType(models.TextChoices):
    FULL_TIME = "full_time", "Full-time"
    PART_TIME = "part_time", "Part-time"
    INTERNSHIP = "internship", "Internship"
    APPRENTICESHIP = "apprenticeship", "Apprenticeship"
    FIXED_TERM = "fixed_term", "Fixed-term"
    FREELANCE = "freelance", "Freelance"


class WorkMode(models.TextChoices):
    ON_SITE = "on_site", "On-site"
    HYBRID = "hybrid", "Hybrid"
    REMOTE = "remote", "Remote"
