// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/types.ts

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string | null;
  platform: string;
  raw_url: string;
  canonical_url: string;
  posted_at: string | null;
}
