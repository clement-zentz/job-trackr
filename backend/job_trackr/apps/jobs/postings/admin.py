# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/admin.py

from django.contrib import admin

from .models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin[JobPosting]):
    list_display = (
        "title",
        "company",
        "owner",
        "location",
        "platform",
        "employment_type",
        "work_mode",
        "easy_apply",
        "active_hiring",
        "posted_on",
        "created_at",
    )

    list_filter = (
        "owner",
        "platform",
        "employment_type",
        "work_mode",
        "easy_apply",
        "active_hiring",
        "posted_on",
        "created_at",
    )

    search_fields = (
        "title",
        "company",
        "location",
        "url",
        "description",
        "salary",
        "owner__email",
    )

    ordering = ("-posted_on", "-created_at")

    list_select_related = ("owner",)

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Ownership",
            {
                "fields": ("owner",),
            },
        ),
        (
            "Job information",
            {
                "fields": (
                    "title",
                    "company",
                    "location",
                    "url",
                    "description",
                    "salary",
                )
            },
        ),
        (
            "Classification",
            {
                "fields": (
                    "platform",
                    "employment_type",
                    "work_mode",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "easy_apply",
                    "active_hiring",
                    "posted_on",
                )
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "id",
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )
