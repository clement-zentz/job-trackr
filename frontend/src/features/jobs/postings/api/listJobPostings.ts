// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.ts

import { api } from "@/api/client";
import type { JobPosting } from "../types";

export const listJobPostings = async (): Promise<JobPosting[]> => {
  const response = await api.get<JobPosting[]>("/v1/jobs/postings/");
  return response.data;
};
