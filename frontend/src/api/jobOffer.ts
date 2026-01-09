// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/api/jobOffer.ts

import { api } from "./client";
import type { JobOffer } from "@/features/job_offers/type";

export async function listJobOffers(): Promise<JobOffer[]> {
  const res = await api.get<JobOffer[]>("/job-offers");
  return res.data;
}
