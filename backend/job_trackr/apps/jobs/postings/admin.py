# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/postings/admin.py

from django.contrib import admin

from apps.jobs.postings.models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin[JobPosting]):
    list_display = (
        "title",
        "company",
        "location",
        "platform",
        "employment_type",
        "work_mode",
        "easy_apply",
        "active_hiring",
        "posted_at",
        "created_at",
    )

    list_filter = (
        "platform",
        "employment_type",
        "work_mode",
        "easy_apply",
        "active_hiring",
        "posted_at",
        "created_at",
    )

    search_fields = (
        "title",
        "company",
        "location",
        "url",
        "description",
        "salary",
    )

    ordering = ("-posted_at", "-created_at")

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
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
                    "posted_at",
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
