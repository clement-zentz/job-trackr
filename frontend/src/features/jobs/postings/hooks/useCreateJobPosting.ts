// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useCreateJobPosting.ts

import { useQueryClient } from "@tanstack/react-query";

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";

import { createJobPosting } from "../api/jobPostingsApi";
import { jobPostingsKeys } from "../keys";
import type { JobPostingCreatePayload } from "../types";

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useSessionBoundMutation({
    mutationFn: (payload: JobPostingCreatePayload, signal) =>
      createJobPosting(payload, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPostingsKeys.lists() });
    },
  });
};
