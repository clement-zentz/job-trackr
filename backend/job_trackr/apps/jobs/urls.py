# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/urls.py

from rest_framework.routers import DefaultRouter

from apps.jobs.api.candidacies.views import JobCandidacyViewSet
from apps.jobs.api.postings.views import JobPostingViewSet

router = DefaultRouter()

router.register(
    "postings",
    JobPostingViewSet,
    basename="job-posting",
)

router.register(
    "candidacies",
    JobCandidacyViewSet,
    basename="job-candidacy",
)

urlpatterns = router.urls
