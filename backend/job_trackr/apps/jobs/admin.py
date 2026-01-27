# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/admin.py

from django.contrib import admin

from .models import JobOpportunity, JobPosting


@admin.register(JobOpportunity)
class JobOpportunityAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "url",
        "priority",
        "is_active",
        "updated_at",
    )
    list_filter = ("priority", "is_active")
    search_fields = ("company", "title")
    ordering = ("-updated_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "job_opportunity",
        "posted_at",
        "date_scraped",
    )
    list_filter = ("platform", "ingestion_source")
    search_fields = ("title", "company", "location", "raw_url", "job_key")
    ordering = ("-date_scraped",)

    readonly_fields = ("date_scraped",)
