// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPosting.ts

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getJobPosting } from "../api/jobPostingsApi";
import { jobPostingsKeys } from "../keys";

export function useJobPosting(id: string | undefined) {
  return useQuery({
    queryKey: id ? jobPostingsKeys.detail(id) : jobPostingsKeys.details(),
    queryFn: () => {
      if (!id) {
        throw new Error("Job posting ID is required");
      }

      return getJobPosting(id);
    },
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }

      return failureCount < 3;
    },
  });
}
