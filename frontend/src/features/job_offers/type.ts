// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/type.ts

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  platform: string;
}
