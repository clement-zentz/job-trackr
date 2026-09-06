// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useUpdateJobCandidacy.ts

import { useQueryClient } from "@tanstack/react-query";

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";

import { updateJobCandidacy } from "../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../keys";
import type { JobCandidacyUpdatePayload } from "../types";

interface UpdateJobCandidacyVariables {
  candidacyId: string;
  payload: JobCandidacyUpdatePayload;
}

export function useUpdateJobCandidacy() {
  const queryClient = useQueryClient();

  return useSessionBoundMutation({
    mutationFn: (
      { candidacyId, payload }: UpdateJobCandidacyVariables,
      signal,
    ) => updateJobCandidacy(candidacyId, payload, signal),

    onSuccess: async (updatedCandidacy) => {
      queryClient.setQueryData(
        jobCandidaciesKeys.detail(updatedCandidacy.id),
        updatedCandidacy,
      );

      await queryClient.invalidateQueries({
        queryKey: jobCandidaciesKeys.lists(),
      });
    },
  });
}
