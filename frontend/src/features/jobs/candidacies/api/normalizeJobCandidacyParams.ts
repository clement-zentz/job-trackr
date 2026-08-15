// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/normalizeJobCandidacyParams.ts

import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../constants";
import type { JobCandidacyListParams, JobCandidacyQueryParams } from "../types";

function normalizeSearch(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function normalizeJobCandidacyParams(
  params: JobCandidacyListParams = {},
): JobCandidacyQueryParams {
  const {
    page,
    search,
    status,
    appliedOnAfter,
    appliedOnBefore,
    platform,
    employmentType,
    workMode,
    ordering,
  } = params;

  const normalizedSearch = normalizeSearch(search);

  return {
    ...(normalizedSearch !== undefined && { search: normalizedSearch }),
    ...(status !== undefined && { status }),
    ...(appliedOnAfter !== undefined && {
      applied_on_after: appliedOnAfter,
    }),
    ...(appliedOnBefore !== undefined && {
      applied_on_before: appliedOnBefore,
    }),
    ...(platform !== undefined && { platform }),
    ...(employmentType !== undefined && {
      employment_type: employmentType,
    }),
    ...(workMode !== undefined && { work_mode: workMode }),
    ...(ordering !== undefined && { ordering }),
    page: page ?? 1,
    page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
  };
}
