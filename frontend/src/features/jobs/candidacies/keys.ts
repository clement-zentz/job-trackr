// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/keys.ts

import type { JobCandidacyQueryParams } from "./types";

export const jobCandidaciesKeys = {
  all: ["job-candidacies"] as const,

  lists: () => [...jobCandidaciesKeys.all, "list"] as const,

  list: (params: JobCandidacyQueryParams) =>
    [...jobCandidaciesKeys.lists(), params] as const,

  details: () => [...jobCandidaciesKeys.all, "detail"] as const,

  detail: (candidacyId: string) =>
    [...jobCandidaciesKeys.details(), candidacyId] as const,
};
