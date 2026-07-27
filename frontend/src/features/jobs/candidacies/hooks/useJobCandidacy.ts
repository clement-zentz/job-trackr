// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/useJobCandidacy.ts

import { useQuery } from "@tanstack/react-query";

import { getJobCandidacy } from "../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../keys";

export function useJobCandidacy(candidacyId: string) {
  return useQuery({
    queryKey: jobCandidaciesKeys.detail(candidacyId),
    queryFn: () => getJobCandidacy(candidacyId),
    enabled: Boolean(candidacyId),
  });
}
