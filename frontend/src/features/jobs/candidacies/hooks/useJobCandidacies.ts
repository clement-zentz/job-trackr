// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useJobCandidacies.ts

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listJobCandidacies } from "../api/jobCandidaciesApi";
import { normalizeJobCandidacyParams } from "../api/normalizeJobCandidacyParams";
import { jobCandidaciesKeys } from "../keys";
import type { JobCandidacyListParams } from "../types";

export function useJobCandidacies(params: JobCandidacyListParams = {}) {
  const normalizedParams = normalizeJobCandidacyParams(params);

  return useQuery({
    queryKey: jobCandidaciesKeys.list(normalizedParams),
    queryFn: () => listJobCandidacies(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
