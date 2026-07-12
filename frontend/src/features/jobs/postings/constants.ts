// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/constants.ts

import { generatePath } from "react-router-dom";

// --- Job Posting Pagination ---
export const DEFAULT_JOB_POSTINGS_PAGE_SIZE = 20;

// --- Job Posting Routes and Paths ---
const JOB_POSTINGS_BASE_PATH = "/jobs/postings";

export const JOB_POSTINGS_LIST_PATH = JOB_POSTINGS_BASE_PATH;
export const JOB_POSTINGS_CREATE_PATH = `${JOB_POSTINGS_BASE_PATH}/create`;
export const JOB_POSTINGS_DETAIL_PATH = `${JOB_POSTINGS_BASE_PATH}/:id`;
export const JOB_POSTINGS_EDIT_PATH = `${JOB_POSTINGS_BASE_PATH}/:id/edit`;

export function getJobPostingDetailPath(jobPostingId: string): string {
  return generatePath(JOB_POSTINGS_DETAIL_PATH, {
    id: jobPostingId,
  });
}

export function getJobPostingEditPath(jobPostingId: string): string {
  return generatePath(JOB_POSTINGS_EDIT_PATH, {
    id: jobPostingId,
  });
}
