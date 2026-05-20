# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/candidacies/admin.py

from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.text import Truncator

from .models import JobCandidacy


@admin.register(JobCandidacy)
class JobCandidacyAdmin(admin.ModelAdmin[JobCandidacy]):
    list_display = (
        "short_job_candidacy",
        "job_posting_link",
        "status",
        "applied_on",
        "updated_at",
    )

    list_display_links = ("short_job_candidacy",)

    list_select_related = ("job_posting",)

    list_filter = (
        "status",
        "applied_on",
    )

    search_fields = (
        "job_posting__title",
        "job_posting__company",
        "job_posting__location",
        "job_posting__platform",
        "notes",
    )

    ordering = ("-applied_on", "-created_at")
    date_hierarchy = "applied_on"

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "job_posting",
                    "status",
                    "applied_on",
                    "notes",
                )
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    @admin.display(description="Candidacy", ordering="job_posting__title")
    def short_job_candidacy(self, obj: JobCandidacy) -> str:
        title = Truncator(obj.job_posting.title).chars(60)
        return f"{title} — {obj.status_label()}"

    @admin.display(description="Job Posting", ordering="job_posting__company")
    def job_posting_link(self, obj: JobCandidacy) -> str:
        label = f"{obj.job_posting.company} — {obj.job_posting.location}"

        url = reverse(
            "admin:jobs_jobposting_change",
            args=[obj.job_posting.pk],
        )

        return format_html('<a href="{}">{}</a>', url, label)
