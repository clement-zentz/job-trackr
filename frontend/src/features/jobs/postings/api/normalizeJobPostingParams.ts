// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/normalizeJobPostingParams.ts

import type { JobPostingListParams, JobPostingQueryParams } from "../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

export function normalizeJobPostingParams(
  params: JobPostingListParams = {},
): JobPostingQueryParams {
  const { page, pageSize, ...rest } = params;

  const cleanedParams = Object.fromEntries(
    Object.entries(rest)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
      .filter(
        ([, value]) =>
          value !== undefined && !(typeof value === "string" && value === ""),
      ),
  ) as Partial<JobPostingListParams>;

  // Extract camelCase fields that need mapping
  const { easyApply, activeHiring, ...restCleaned } = cleanedParams;

  return {
    ...restCleaned,

    // Explicit camelCase → snake_case mapping
    ...(easyApply !== undefined && { easy_apply: easyApply }),
    ...(activeHiring !== undefined && { active_hiring: activeHiring }),

    // Pagination (always defined)
    page: page ?? 1,
    page_size: pageSize ?? DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  };
}
