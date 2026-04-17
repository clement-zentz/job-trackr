// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPosting, JobPostingListParams } from "../types";
import { normalizeJobPostingParams } from "./normalizeJobPostingParams";

export const listJobPostings = async (
  params: JobPostingListParams = {},
): Promise<PaginatedResponse<JobPosting>> => {
  const queryParams = normalizeJobPostingParams(params);

  const response = await api.get<PaginatedResponse<JobPosting>>(
    "/v1/jobs/postings/",
    { params: queryParams },
  );

  return response.data;
};
