// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/jobCandidacy.ts

import type { JobCandidacyListItemRead } from "@/features/jobs/candidacies/types";

type JobCandidacyListItemReadOverrides = Omit<
  Partial<JobCandidacyListItemRead>,
  "job_posting"
> & {
  job_posting?: Partial<JobCandidacyListItemRead["job_posting"]>;
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
