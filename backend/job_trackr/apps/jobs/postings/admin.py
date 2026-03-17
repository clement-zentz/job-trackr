# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/admin.py

from django.contrib import admin

from .models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "job_opportunity",
        "posted_at",
        "created_at",
    )
    list_filter = ("platform",)
    search_fields = ("title", "company", "location", "raw_url", "job_key")
    ordering = ("-created_at",)

    readonly_fields = ("created_at",)
