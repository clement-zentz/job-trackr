// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPosting } from "../types";

interface ListJobPostingsParams {
  page?: number;
  pageSize?: number;
}

export const listJobPostings = async ({
  page = 1,
  pageSize = 20,
}: ListJobPostingsParams = {}): Promise<PaginatedResponse<JobPosting>> => {
  const response = await api.get<PaginatedResponse<JobPosting>>(
    "/v1/jobs/postings/",
    {
      params: {
        page,
        page_size: pageSize,
      },
    },
  );

  return response.data;
};
