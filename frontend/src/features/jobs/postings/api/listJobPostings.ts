// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPosting, JobPostingQueryParams } from "../types";

export const listJobPostings = async (
  params: JobPostingQueryParams,
): Promise<PaginatedResponse<JobPosting>> => {
  const response = await api.get<PaginatedResponse<JobPosting>>(
    "/v1/jobs/postings/",
    { params },
  );

  return response.data;
};
