# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/admin.py

from django.contrib import admin

from .models import IngestedJobPosting


@admin.register(IngestedJobPosting)
class IngestedJobPostingAdmin(admin.ModelAdmin):
    list_display = (
        "platform",
        "title",
        "company",
        "status",
        "ingested_at",
    )
    list_filter = ("platform", "status", "ingestion_source")
    search_fields = ("title", "company", "raw_url", "job_key")
    ordering = ("-ingested_at",)

    readonly_fields = ("ingested_at",)
