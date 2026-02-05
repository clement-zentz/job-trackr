# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/urls.py

from django.urls import path

from .views import IngestJobPostingsView

urlpatterns = [path("ingest/job-postings/", IngestJobPostingsView.as_view())]
