// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/normalizeJobCandidacyParams.ts

import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../constants";
import type { JobCandidacyListParams, JobCandidacyQueryParams } from "../types";

export function normalizeJobCandidacyParams(
  params: JobCandidacyListParams = {},
): JobCandidacyQueryParams {
  return {
    page: params.page ?? 1,
    page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
  };
}
