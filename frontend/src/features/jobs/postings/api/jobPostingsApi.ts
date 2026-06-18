// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/jobPostingsApi.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  JobPostingCreatePayload,
  JobPostingDetailRead,
  JobPostingListItemRead,
  JobPostingQueryParams,
} from "../types";

export const listJobPostings = async (
  params: JobPostingQueryParams,
): Promise<PaginatedResponse<JobPostingListItemRead>> => {
  const response = await api.get<PaginatedResponse<JobPostingListItemRead>>(
    "/v1/jobs/postings/",
    { params },
  );

  return response.data;
};

export const getJobPosting = async (
  id: string,
): Promise<JobPostingDetailRead> => {
  const response = await api.get<JobPostingDetailRead>(
    `/v1/jobs/postings/${id}/`,
  );
  return response.data;
};

export const createJobPosting = async (
  payload: JobPostingCreatePayload,
): Promise<JobPostingDetailRead> => {
  const response = await api.post<JobPostingDetailRead>(
    "/v1/jobs/postings/",
    payload,
  );

  return response.data;
};
