# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/urls_legacy.py

from django.urls import path

from apps.ingestion.views import IngestJobPostingsView

urlpatterns = [
    # Backward-compatible alias
    path(
        "ingest/job-postings/",
        IngestJobPostingsView.as_view(),
        name="ingest-job-postings-legacy",
    )
]
