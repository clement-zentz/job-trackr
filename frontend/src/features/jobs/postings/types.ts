// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/types.ts

import type { EmploymentType, Platform, WorkMode } from "./choices";

// --- API READ MODELS ---

// API response body returned by job posting endpoints.
export interface JobPostingListItemRead {
  id: string;

  title: string;
  company: string;
  location: string;

  url: string;
  description_preview: string;
  salary: string;

  easy_apply: boolean;
  active_hiring: boolean;

  platform: Platform;
  platform_label: string;

  employment_type: EmploymentType;
  employment_type_label: string;

  work_mode: WorkMode;
  work_mode_label: string;

  candidacy_id: string | null;

  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobPostingDetailRead extends JobPostingListItemRead {
  description: string;
}

// --- API WRITE MODELS ---

// API request body for create/update
export interface JobPostingWritePayload {
  title: string;
  company: string;
  location: string;

  url?: string;
  salary?: string;
  description?: string;

  easy_apply?: boolean;
  active_hiring?: boolean;

  platform?: Platform;
  employment_type?: EmploymentType;
  work_mode?: WorkMode;

  posted_at?: string | null;
}

export type JobPostingCreatePayload = JobPostingWritePayload;

export type JobPostingUpdatePayload = Partial<JobPostingWritePayload>;

// --- FORM MODELS ---

export interface JobPostingFormValues {
  title: string;
  company: string;
  location: string;

  url: string;
  salary: string;
  description: string;

  easy_apply: boolean;
  active_hiring: boolean;

  platform: Platform;
  employment_type: EmploymentType;
  work_mode: WorkMode;

  posted_at: string;
}

// --- API QUERY MODELS ---

/**
 * Frontend query params used by the UI and React state
 *
 * - Uses camelCase naming (e.g. `pageSize`)
 * - Allows optional and raw values (e.g. undefined, empty strings)
 * - Represents the user-controlled filter state before normalization
 *
 * These params are transformed into `JobPostingQueryParams`
 * before being sent to the API.
 */
export interface JobPostingListParams {
  page?: number;
  pageSize?: number;

  search?: string;

  company?: string;
  location?: string;
  platform?: string;

  easyApply?: boolean;
  activeHiring?: boolean;

  ordering?: string; // "-posted_at", "company", etc.
}

/**
 * Subset of JobPostingListParams used for UI filtering.
 *
 * Excludes pagination fields to enforce separation of concerns:
 * - filters: UI-controlled search/filter criteria
 * - pagination: managed independently (page, pageSize)
 */
export type JobPostingFilters = Omit<JobPostingListParams, "page" | "pageSize">;

/**
 * Normalized API query params sent to the backend (DRF).
 *
 * - Uses snake_case naming (e.g. `page_size`)
 * - Applied default values (e.g. page, page_size are always defined)
 * - Removes empty or undefined values
 *
 * Produced by `normalizeJobPostingParams` before making API requests
 * and used for React Query cache keys.
 */
export interface JobPostingQueryParams {
  page: number;
  page_size: number;

  search?: string;

  company?: string;
  location?: string;
  platform?: string;

  easy_apply?: boolean;
  active_hiring?: boolean;

  ordering?: string;
}
