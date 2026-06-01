// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/createJobPosting.ts

import { api } from "@/api/client";
import type { JobPostingCreatePayload, JobPostingRead } from "../types";

export const createJobPosting = async (
  payload: JobPostingCreatePayload,
): Promise<JobPostingRead> => {
  const response = await api.post<JobPostingRead>(
    "/v1/jobs/postings/",
    payload,
  );

  return response.data;
};
