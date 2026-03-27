// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostings.ts

import { useQuery } from "@tanstack/react-query";
import { listJobPostings } from "../api/listJobPostings";

export const useJobPostings = () => {
  return useQuery({
    queryKey: ["job-postings"],
    queryFn: listJobPostings,
  });
};
