// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useDeleteJobPosting.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteJobPosting } from "../api/jobPostingsApi";
import { jobPostingsKeys } from "../keys";

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteJobPosting(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: jobPostingsKeys.lists(),
      });
    },
  });
}
