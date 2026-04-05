# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/common/api/pagination.py

from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    # NOTE:
    # `page_size` is intentionally defined here as the primary source of truth.
    # Although DRF also supports a global `PAGE_SIZE` setting, it is overridden
    # by pagination classes.
    #
    # Pagination is configured globally via `DEFAULT_PAGINATION_CLASS`, meaning
    # all DRF list endpoints will return a paginated response:
    # { "count", "next", "previous", "results" } instead of a raw list.
    #
    # This is an intentional design choice to enforce a consistent API contract
    # across endpoints and simplify frontend data handling. Tests and consumers
    # should rely on the paginated structure.
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
