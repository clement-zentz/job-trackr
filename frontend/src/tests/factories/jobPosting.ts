// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/jobPosting.ts

import type {
  JobPostingDetailRead,
  JobPostingListItemRead,
  JobPostingCreatePayload,
} from "@/features/jobs/postings/types";

export function createJobPostingListItemRead(
  overrides: Partial<JobPostingListItemRead> = {},
): JobPostingListItemRead {
  return {
    id: "job-123",
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
    url: "",
    description_preview: "",
    salary: "",
    easy_apply: false,
    active_hiring: false,
    platform: "",
    platform_label: "",
    employment_type: "",
    employment_type_label: "",
    work_mode: "",
    work_mode_label: "",
    candidacy_id: null,
    posted_at: null,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
    ...overrides,
  } satisfies JobPostingListItemRead;
}

export function createJobPostingDetailRead(
  overrides: Partial<JobPostingDetailRead> = {},
): JobPostingDetailRead {
  const { description, ...listOverrides } = overrides;
  const resolvedDescription = description ?? "Full job posting description.";
  const base = createJobPostingListItemRead(listOverrides);

  return {
    ...base,
    description: resolvedDescription,
    description_preview: base.description_preview || resolvedDescription,
  } satisfies JobPostingDetailRead;
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
