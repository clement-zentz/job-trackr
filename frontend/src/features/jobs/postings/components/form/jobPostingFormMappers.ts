// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/form/jobPostingFormMappers.ts

import type {
  JobPostingDetailRead,
  JobPostingFormValues,
  JobPostingCreatePayload,
  JobPostingUpdatePayload,
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

export function jobPostingToFormValues(
  jobPosting: JobPostingDetailRead,
): JobPostingFormValues {
  return {
    title: jobPosting.title,
    company: jobPosting.company,
    location: jobPosting.location,

    url: jobPosting.url ?? "",
    salary: jobPosting.salary ?? "",
    description: jobPosting.description ?? "",

    easy_apply: jobPosting.easy_apply ?? false,
    active_hiring: jobPosting.active_hiring ?? false,

    platform: jobPosting.platform ?? "",
    employment_type: jobPosting.employment_type ?? "",
    work_mode: jobPosting.work_mode ?? "",

    posted_at: jobPosting.posted_at ?? "",
  };
}

export function formValuesToUpdatePayload(
  formValues: JobPostingFormValues,
): JobPostingUpdatePayload {
  return {
    ...formValues,
    posted_at: formValues.posted_at || null,
  };
}
