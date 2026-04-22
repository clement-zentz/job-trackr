// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/types.ts

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string | null;
  platform: string;
  raw_url: string;
  canonical_url: string;
  posted_at: string | null;
}

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
