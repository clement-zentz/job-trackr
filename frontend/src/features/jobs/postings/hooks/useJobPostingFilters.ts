// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostingFilters.ts

import { useState } from "react";
import type { JobPostingFilters } from "../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

const DEFAULT_FILTERS: JobPostingFilters = {
  ordering: "-posted_at",
};

export const useJobPostingFilters = () => {
  const [filters, setFilters] = useState<JobPostingFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_JOB_POSTINGS_PAGE_SIZE);

  /**
   * Update a single filter value and reset page to 1
   */
  const updateFilter = <K extends keyof JobPostingFilters>(
    key: K,
    value: JobPostingFilters[K],
  ) => {
    setFilters((prev) => {
      const isEmpty =
        value === undefined ||
        (typeof value === "string" && value.trim() === "");

      // Remove key if value is empty
      if (isEmpty) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      // Otherwise update normally
      return {
        ...prev,
        [key]: value,
      };
    });

    // Reset page when filters change
    setPage(1);
  };

  /**
   * Reset all filters
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
