// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useUpdateJobPosting.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateJobPosting } from "../api/jobPostingsApi";
import { jobPostingsKeys } from "../keys";
import type { JobPostingUpdatePayload } from "../types";

type UpdateJobPostingVariables = {
  id: string;
  payload: JobPostingUpdatePayload;
};

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateJobPostingVariables) =>
      updateJobPosting(id, payload),

    onSuccess: (updatedJobPosting) => {
      queryClient.invalidateQueries({ queryKey: jobPostingsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobPostingsKeys.detail(updatedJobPosting.id),
      });
    },
  });
}
