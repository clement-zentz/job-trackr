// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useDeleteJobPosting.ts

import { useQueryClient } from "@tanstack/react-query";

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";

import { deleteJobPosting } from "../api/jobPostingsApi";
import { jobPostingsKeys } from "../keys";

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useSessionBoundMutation({
    mutationFn: (id: string, signal) => deleteJobPosting(id, signal),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: jobPostingsKeys.lists(),
      });
    },
  });
}
