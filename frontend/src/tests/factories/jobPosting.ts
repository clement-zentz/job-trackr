// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/jobPosting.ts

import type { JobPosting } from "@/features/jobs/postings/types";

export function createJobPosting(
  overrides: Partial<JobPosting> = {},
): JobPosting {
  return {
    id: "job-123",
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
    platform: "linkedin",
    platform_label: "LinkedIn",
    url: "https://example.com/123",
    posted_at: "2025-01-01T10:00:00Z",
    ...overrides,
  } satisfies JobPosting;
}
