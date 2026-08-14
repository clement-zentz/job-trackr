// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/types.ts

import type { CandidacyStatus } from "./choices";

export interface JobPostingSummaryRead {
  id: string;
  title: string;
  company: string;
  location: string;
}

export interface JobCandidacyListItemRead {
  id: string;
  job_posting: JobPostingSummaryRead;
  status: CandidacyStatus;
  status_label: string;
  applied_on: string;
  notes_preview: string;
  created_at: string;
  updated_at: string;
}

export interface JobCandidacyDetailRead extends JobCandidacyListItemRead {
  notes: string;
}

export interface JobCandidacyMutablePayload {
  status: CandidacyStatus;
  applied_on: string;
  notes: string;
}

export interface JobCandidacyCreatePayload extends JobCandidacyMutablePayload {
  job_posting: string;
}

export type JobCandidacyUpdatePayload = Partial<JobCandidacyMutablePayload>;

export interface JobCandidacyFormValues {
  status: CandidacyStatus;
  applied_on: string;
  notes: string;
}

export interface JobCandidacyListParams {
  page?: number;
}

export interface JobCandidacyQueryParams {
  page: number;
  page_size: number;
}
