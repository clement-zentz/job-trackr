// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/jobCandidaciesApi.ts

import { api } from "@/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  JobCandidacyCreatePayload,
  JobCandidacyDetailRead,
  JobCandidacyListItemRead,
  JobCandidacyQueryParams,
} from "../types";

const JOB_CANDIDACIES_ENDPOINT = "/v1/jobs/candidacies/";

export async function listJobCandidacies(
  params: JobCandidacyQueryParams,
): Promise<PaginatedResponse<JobCandidacyListItemRead>> {
  const response = await api.get<PaginatedResponse<JobCandidacyListItemRead>>(
    JOB_CANDIDACIES_ENDPOINT,
    {
      params,
    },
  );

  return response.data;
}

export async function getJobCandidacy(
  candidacyId: string,
): Promise<JobCandidacyDetailRead> {
  const response = await api.get<JobCandidacyDetailRead>(
    `${JOB_CANDIDACIES_ENDPOINT}${candidacyId}/`,
  );

  return response.data;
}

export async function createJobCandidacy(
  payload: JobCandidacyCreatePayload,
): Promise<JobCandidacyDetailRead> {
  const response = await api.post<JobCandidacyDetailRead>(
    JOB_CANDIDACIES_ENDPOINT,
    payload,
  );

  return response.data;
}
