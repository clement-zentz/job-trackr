// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/jobCandidacy.ts

import type {
  JobCandidacyCreatePayload,
  JobCandidacyDetailRead,
  JobCandidacyListItemRead,
  JobCandidacyUpdatePayload,
} from "@/features/jobs/candidacies/types";

type JobCandidacyListItemReadOverrides = Omit<
  Partial<JobCandidacyListItemRead>,
  "job_posting"
> & {
  job_posting?: Partial<JobCandidacyListItemRead["job_posting"]>;
};

type JobCandidacyDetailReadOverrides = JobCandidacyListItemReadOverrides & {
  notes?: JobCandidacyDetailRead["notes"];
};

export function createJobCandidacyListItemRead(
  overrides: JobCandidacyListItemReadOverrides = {},
): JobCandidacyListItemRead {
  const { job_posting: jobPostingOverrides, ...candidacyOverrides } = overrides;

  return {
    id: "candidacy-1",
    job_posting: {
      id: "job-1",
      title: "Software Engineer",
      company: "Tech Corp",
      location: "Remote",
      ...jobPostingOverrides,
    },
    status: "applied",
    status_label: "Applied",
    applied_on: "2024-01-01",
    notes_preview: "Looking forward to this opportunity.",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...candidacyOverrides,
  } satisfies JobCandidacyListItemRead;
}

export function createJobCandidacyDetailRead(
  overrides: JobCandidacyDetailReadOverrides = {},
): JobCandidacyDetailRead {
  const {
    notes = "Looking forward to this opportunity.",
    ...listItemOverrides
  } = overrides;

  return {
    ...createJobCandidacyListItemRead(listItemOverrides),
    notes,
  } satisfies JobCandidacyDetailRead;
}

export function createJobCandidacyCreatePayload(
  overrides: Partial<JobCandidacyCreatePayload> = {},
): JobCandidacyCreatePayload {
  return {
    job_posting: "job-1",
    status: "applied",
    applied_on: "2024-01-01",
    notes: "Looking forward to this opportunity.",
    ...overrides,
  } satisfies JobCandidacyCreatePayload;
}

export function createJobCandidacyUpdatePayload(
  overrides: JobCandidacyUpdatePayload = {},
): JobCandidacyUpdatePayload {
  return {
    status: "interview",
    applied_on: "2026-08-05",
    notes: "First interview scheduled.",
    ...overrides,
  } satisfies JobCandidacyUpdatePayload;
}
