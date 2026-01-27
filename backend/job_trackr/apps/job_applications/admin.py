# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/job_applications/admin.py

from django.contrib import admin

from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "job_opportunity",
        "job_posting",
        "status",
        "job_application_date",
        "updated_at",
    )
    list_filter = ("status",)
    search_fields = (
        "job_opportunity__company",
        "job_opportunity__title",
        "job_posting__platform",
    )
    ordering = ("-job_application_date",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )
