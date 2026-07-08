// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/form/jobPostingFormMappers.ts

import type {
  JobPostingFormValues,
  JobPostingCreatePayload,
} from "../../types";

export const emptyJobPostingFormValues: JobPostingFormValues = {
  title: "",
  company: "",
  location: "",

  url: "",
  salary: "",
  description: "",

  easy_apply: false,
  active_hiring: false,

  platform: "",
  employment_type: "",
  work_mode: "",

  posted_at: "",
};

export function formValuesToCreatePayload(
  formValues: JobPostingFormValues,
): JobPostingCreatePayload {
  return {
    ...formValues,
    url: formValues.url || undefined,
    salary: formValues.salary || undefined,
    description: formValues.description || undefined,
    platform: formValues.platform || undefined,
    employment_type: formValues.employment_type || undefined,
    work_mode: formValues.work_mode || undefined,
    posted_at: formValues.posted_at || null,
  };
}
