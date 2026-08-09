// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useDeleteJobCandidacy.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobPostingsKeys } from "@/features/jobs/postings/keys";

import { deleteJobCandidacy } from "../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../keys";

interface DeleteJobCandidacyVariables {
  candidacyId: string;
  jobPostingId: string;
}

export function useDeleteJobCandidacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidacyId }: DeleteJobCandidacyVariables) =>
      deleteJobCandidacy(candidacyId),

    onSuccess: async (_, { candidacyId, jobPostingId }) => {
      queryClient.removeQueries({
        queryKey: jobCandidaciesKeys.detail(candidacyId),
        exact: true,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jobCandidaciesKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostingsKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostingsKeys.detail(jobPostingId),
        }),
      ]);
    },
  });
}
