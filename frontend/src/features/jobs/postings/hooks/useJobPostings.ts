// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostings.ts

import { useQuery } from "@tanstack/react-query";

import { listJobPostings } from "../api/jobPostingsApi";
import { normalizeJobPostingParams } from "../api/normalizeJobPostingParams";
import { jobPostingsKeys } from "../keys";
import type { JobPostingListParams } from "../types";

export const useJobPostings = (params: JobPostingListParams) => {
  const normalizedParams = normalizeJobPostingParams(params);

  return useQuery({
    queryKey: jobPostingsKeys.list(normalizedParams),
    queryFn: () => listJobPostings(normalizedParams),
    placeholderData: (previousData) => previousData,
  });
};
