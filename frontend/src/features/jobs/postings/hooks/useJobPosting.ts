// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPosting.ts

import { useQuery } from "@tanstack/react-query";
import { getJobPosting } from "../api/jobPostingsApi";

export function useJobPosting(id: string | undefined) {
  return useQuery({
    queryKey: ["job-postings", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Job posting ID is required");
      }

      return getJobPosting(id);
    },
    enabled: Boolean(id),
  });
}
