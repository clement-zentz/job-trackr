// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/jobPostingsApi.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  JobPostingCreatePayload,
  JobPostingDetailRead,
  JobPostingListItemRead,
  JobPostingQueryParams,
  JobPostingUpdatePayload,
} from "../types";

const JOB_POSTINGS_ENDPOINT = "/v1/jobs/postings/";

export async function listJobPostings(
  params: JobPostingQueryParams,
): Promise<PaginatedResponse<JobPostingListItemRead>> {
  const response = await api.get<PaginatedResponse<JobPostingListItemRead>>(
    JOB_POSTINGS_ENDPOINT,
    { params },
  );

  return response.data;
}

export async function getJobPosting(id: string): Promise<JobPostingDetailRead> {
  const response = await api.get<JobPostingDetailRead>(
    `${JOB_POSTINGS_ENDPOINT}${id}/`,
  );
  return response.data;
}

export async function createJobPosting(
  payload: JobPostingCreatePayload,
): Promise<JobPostingDetailRead> {
  const response = await api.post<JobPostingDetailRead>(
    JOB_POSTINGS_ENDPOINT,
    payload,
  );

  return response.data;
}

export async function updateJobPosting(
  id: string,
  payload: JobPostingUpdatePayload,
): Promise<JobPostingDetailRead> {
  const response = await api.patch<JobPostingDetailRead>(
    `${JOB_POSTINGS_ENDPOINT}${id}/`,
    payload,
  );

  return response.data;
}
