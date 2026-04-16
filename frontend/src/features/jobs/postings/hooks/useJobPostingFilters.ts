// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostingFilters.ts

import { useState } from "react";

export interface JobPostingFilters {
  page: number;
  pageSize: number;

  search?: string;

  company?: string;
  location?: string;
  platform?: string;

  easy_apply?: boolean;
  active_hiring?: boolean;

  ordering?: string;
}

const DEFAULT_FILTERS: JobPostingFilters = {
  page: 1,
  pageSize: 10,
  ordering: "-posted_at",
};

export const useJobPostingFilters = () => {
  const [params, setParams] = useState<JobPostingFilters>(DEFAULT_FILTERS);

  /**
   * Generic helper to update a single param
   */
  const updateParam = <K extends keyof JobPostingFilters>(
    key: K,
    value: JobPostingFilters[K],
  ) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change (except page itself)
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  /**
   * Reset all filters (except page size)
   */
  const resetFilters = () => {
    setParams(DEFAULT_FILTERS);
  };

  return {
    params,
    setParams,
    updateParam,
    resetFilters,
  };
};
