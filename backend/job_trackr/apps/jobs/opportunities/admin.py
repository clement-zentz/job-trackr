# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/opportunities/admin.py

from django.contrib import admin

from .models import JobOpportunity


@admin.register(JobOpportunity)
class JobOpportunityAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "priority",
        "is_active",
        "updated_at",
        "description",
    )
    list_filter = ("priority", "is_active")
    search_fields = ("company", "title")
    ordering = ("-updated_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )
