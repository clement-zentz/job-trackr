// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/normalizeJobCandidacyParams.ts

import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../constants";
import type { JobCandidacyListParams, JobCandidacyQueryParams } from "../types";

function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
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

  const normalizedSearch = normalizeOptionalString(search);
  const normalizedAppliedOnAfter = normalizeOptionalString(appliedOnAfter);
  const normalizedAppliedOnBefore = normalizeOptionalString(appliedOnBefore);

  return {
    ...(normalizedSearch !== undefined && { search: normalizedSearch }),
    ...(status !== undefined && { status }),
    ...(normalizedAppliedOnAfter !== undefined && {
      applied_on_after: normalizedAppliedOnAfter,
    }),
    ...(normalizedAppliedOnBefore !== undefined && {
      applied_on_before: normalizedAppliedOnBefore,
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
