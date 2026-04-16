// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPosting, JobPostingListParams } from "../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

export const listJobPostings = async (
  params: JobPostingListParams = {},
): Promise<PaginatedResponse<JobPosting>> => {
  const { page, pageSize, ...rest } = params;

  const cleanedParams = Object.fromEntries(
    Object.entries(rest).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );

  const queryParams = {
    ...cleanedParams,
    page: page ?? 1,
    page_size: pageSize ?? DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  };

  const response = await api.get<PaginatedResponse<JobPosting>>(
    "/v1/jobs/postings/",
    { params: queryParams },
  );

  return response.data;
};
