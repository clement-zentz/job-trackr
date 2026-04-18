// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostingFilters.ts

import { useState } from "react";
import type { JobPostingFilters } from "../types";

const DEFAULT_FILTERS: JobPostingFilters = {
  ordering: "-posted_at",
};

export const useJobPostingFilters = () => {
  const [filters, setFilters] = useState<JobPostingFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /**
   * Update a single filter value and reset page to 1
   */
  const updateFilter = <K extends keyof JobPostingFilters>(
    key: K,
    value: JobPostingFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Reset page when filters change
    setPage(1);
  };

  /**
   * Reset all filters (except page size)
   */
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return {
    filters,
    page,
    pageSize,
    setPage,
    setPageSize,
    updateFilter,
    resetFilters,
  };
};
