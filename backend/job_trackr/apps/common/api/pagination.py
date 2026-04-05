# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/common/api/pagination.py

from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    # NOTE:
    # `page_size` is intentionally defined here as the primary source of truth.
    # Although DRF also supports a global `PAGE_SIZE` setting, it is overridden
    # by pagination classes. Keeping the value here makes pagination behavior
    # explicit and allows different endpoints to define their own strategies.
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
