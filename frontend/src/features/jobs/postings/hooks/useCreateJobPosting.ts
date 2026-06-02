// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useCreateJobPosting.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJobPosting } from "../api/createJobPosting";
import type { JobPostingCreatePayload } from "../types";

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JobPostingCreatePayload) => createJobPosting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
    },
  });
};
