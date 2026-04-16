// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostings.ts

import { useQuery } from "@tanstack/react-query";
import { listJobPostings } from "../api/listJobPostings";
import type { JobPostingListParams } from "../types";

export const useJobPostings = (params: JobPostingListParams) => {
  return useQuery({
    queryKey: ["job-postings", params],
    queryFn: () => listJobPostings(params),
    placeholderData: (previousData) => previousData,
  });
};
