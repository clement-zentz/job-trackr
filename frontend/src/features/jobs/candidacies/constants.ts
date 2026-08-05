// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/constants.ts

import { generatePath } from "react-router-dom";

export const DEFAULT_JOB_CANDIDACIES_PAGE_SIZE = 10;

const JOB_CANDIDACIES_BASE_PATH = "/jobs/candidacies";

export const JOB_CANDIDACIES_LIST_PATH = JOB_CANDIDACIES_BASE_PATH;
export const JOB_CANDIDACY_DETAIL_PATH = `${JOB_CANDIDACIES_BASE_PATH}/:candidacyId`;
export const JOB_CANDIDACY_CREATE_PATH = `${JOB_CANDIDACIES_BASE_PATH}/new`;

export function getJobCandidacyDetailPath(candidacyId: string): string {
  return generatePath(JOB_CANDIDACY_DETAIL_PATH, {
    candidacyId,
  });
}

export function getJobCandidacyCreatePath(jobPostingId: string): string {
  const searchParams = new URLSearchParams({ jobPostingId });

  return `${JOB_CANDIDACY_CREATE_PATH}?${searchParams.toString()}`;
}
