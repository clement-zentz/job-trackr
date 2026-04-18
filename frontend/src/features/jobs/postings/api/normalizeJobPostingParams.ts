// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/normalizeJobPostingParams.ts

import type { JobPostingListParams, JobPostingQueryParams } from "../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

export function normalizeJobPostingParams(
  params: JobPostingListParams = {},
): JobPostingQueryParams {
  const { page, pageSize, ...rest } = params;

  const cleanedParams = Object.fromEntries(
    Object.entries(rest).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );

  return {
    ...cleanedParams,
    page: page ?? 1,
    page_size: pageSize ?? DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  };
}
