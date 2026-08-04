// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/form/jobCandidacyFormMappers.ts

import type {
  JobCandidacyCreatePayload,
  JobCandidacyFormValues,
} from "../../types";

function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createEmptyJobCandidacyFormValues(): JobCandidacyFormValues {
  return {
    status: "applied",
    applied_on: getLocalDateInputValue(),
    notes: "",
  };
}

export function formValuesToCreatePayload(
  jobPostingId: string,
  values: JobCandidacyFormValues,
): JobCandidacyCreatePayload {
  return {
    job_posting: jobPostingId,
    status: values.status,
    applied_on: values.applied_on,
    notes: values.notes.trim(),
  };
}
