// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/api/jobOffer.ts

import { api } from "./client";
import type { JobOfferRead } from "@/features/job_offers/type";

export async function listJobOffers(): Promise<JobOfferRead[]> {
  const res = await api.get<JobOfferRead[]>("/job-offers");
  return res.data;
}
