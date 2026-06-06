// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPostingListItemRead, JobPostingQueryParams } from "../types";

export const listJobPostings = async (
  params: JobPostingQueryParams,
): Promise<PaginatedResponse<JobPostingListItemRead>> => {
  const response = await api.get<PaginatedResponse<JobPostingListItemRead>>(
    "/v1/jobs/postings/",
    { params },
  );

  return response.data;
};
