// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useCreateJobCandidacy.ts

import { useQueryClient } from "@tanstack/react-query";

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";
import { jobPostingsKeys } from "@/features/jobs/postings/keys";

import { createJobCandidacy } from "../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../keys";
import type { JobCandidacyCreatePayload } from "../types";

export function useCreateJobCandidacy() {
  const queryClient = useQueryClient();

  return useSessionBoundMutation({
    mutationFn: (payload: JobCandidacyCreatePayload, signal) =>
      createJobCandidacy(payload, signal),

    onSuccess: async (createdCandidacy) => {
      queryClient.setQueryData(
        jobCandidaciesKeys.detail(createdCandidacy.id),
        createdCandidacy,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jobCandidaciesKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostingsKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostingsKeys.detail(createdCandidacy.job_posting.id),
        }),
      ]);
    },
  });
}
