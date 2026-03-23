# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/urls.py

from rest_framework.routers import DefaultRouter

from apps.jobs.api.opportunities.views import JobOpportunityViewSet
from apps.jobs.api.postings.views import JobPostingViewSet

router = DefaultRouter()

router.register(
    "opportunities",
    JobOpportunityViewSet,
    basename="job-opportunity",
)

router.register(
    "postings",
    JobPostingViewSet,
    basename="job-posting",
)

urlpatterns = router.urls
