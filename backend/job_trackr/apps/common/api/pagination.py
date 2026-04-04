# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/common/api/pagination.py

from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
