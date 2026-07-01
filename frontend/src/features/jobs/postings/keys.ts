// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/keys.ts

import type { JobPostingQueryParams } from "./types";

export const jobPostingsKeys = {
  all: ["job-postings"] as const,
  lists: () => [...jobPostingsKeys.all, "list"] as const,
  list: (params: JobPostingQueryParams) =>
    [...jobPostingsKeys.lists(), params] as const,
  details: () => [...jobPostingsKeys.all, "detail"] as const,
  detail: (id: string) => [...jobPostingsKeys.details(), id] as const,
};
