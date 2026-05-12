# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/candidacies/admin.py

from django.contrib import admin

from .models import JobCandidacy


@admin.register(JobCandidacy)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "job_posting",
        "status",
        "job_candidacy_date",
        "updated_at",
    )
    list_filter = ("status",)
    search_fields = ("job_posting__platform",)
    ordering = ("-job_candidacy_date",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )
