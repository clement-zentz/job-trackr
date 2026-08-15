// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useJobCandidacyFilters.ts

import { useState } from "react";

import type { JobCandidacyFilters } from "../types";

const DEFAULT_FILTERS: JobCandidacyFilters = {};

export const useJobCandidacyFilters = () => {
  const [filters, setFilters] = useState<JobCandidacyFilters>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);

  const updateFilter = <K extends keyof JobCandidacyFilters>(
    key: K,
    value: JobCandidacyFilters[K],
  ) => {
    setFilters((prev) => {
      const isEmpty =
        value === undefined ||
        (typeof value === "string" && value.trim() === "");

      if (isEmpty) {
        const next = { ...prev };
        delete next[key];

        return next;
      }

      return {
        ...prev,
        [key]: value,
      };
    });

    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return {
    filters,
    page,
    setPage,
    updateFilter,
    resetFilters,
  };
};
