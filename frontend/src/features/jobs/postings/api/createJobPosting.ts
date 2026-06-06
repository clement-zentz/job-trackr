// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/createJobPosting.ts

import { api } from "@/api/client";
import type { JobPostingCreatePayload, JobPostingDetailRead } from "../types";

export const createJobPosting = async (
  payload: JobPostingCreatePayload,
): Promise<JobPostingDetailRead> => {
  const response = await api.post<JobPostingDetailRead>(
    "/v1/jobs/postings/",
    payload,
  );

  return response.data;
};
