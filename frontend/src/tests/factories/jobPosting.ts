// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/jobPosting.ts

import type {
  JobPostingRead,
  JobPostingCreatePayload,
} from "@/features/jobs/postings/types";

export function createJobPostingRead(
  overrides: Partial<JobPostingRead> = {},
): JobPostingRead {
  return {
    id: "job-123",
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
    url: "",
    description: "",
    description_preview: "",
    salary: "",
    easy_apply: false,
    active_hiring: false,
    platform: "unknown",
    platform_label: "Unknown",
    employment_type: "unknown",
    employment_type_label: "Unknown",
    work_mode: "unknown",
    work_mode_label: "Unknown",
    candidacy_id: null,
    posted_at: null,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
    ...overrides,
  } satisfies JobPostingRead;
}

export function createJobPostingCreatePayload(
  overrides: Partial<JobPostingCreatePayload> = {},
): JobPostingCreatePayload {
  return {
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
    ...overrides,
  } satisfies JobPostingCreatePayload;
}
