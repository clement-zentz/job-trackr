// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingFormMappers.test.ts

import { describe, expect, it } from "vitest";
import {
  emptyJobPostingFormValues,
  formValuesToCreatePayload,
} from "../form/jobPostingFormMappers";

describe("JobPostingFormMappers", () => {
  it("maps empty form values to create payload", () => {
    expect(formValuesToCreatePayload(emptyJobPostingFormValues)).toEqual({
      title: "",
      company: "",
      location: "",

      url: undefined,
      salary: undefined,
      description: undefined,

      easy_apply: false,
      active_hiring: false,

      platform: undefined,
      employment_type: undefined,
      work_mode: undefined,

      posted_at: null,
    });
  });

  it("keeps filled form values in a create payload", () => {
    expect(
      formValuesToCreatePayload({
        ...emptyJobPostingFormValues,
        title: "Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        url: "https://techcorp.com/jobs/123",
        salary: "$120,000 - $150,000",
        description: "We are looking for a skilled software engineer.",
        easy_apply: true,
        active_hiring: true,
        platform: "linkedin",
        employment_type: "full_time",
        work_mode: "remote",
        posted_at: "2024-06-01T12:00:00Z",
      }),
    ).toEqual({
      title: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",

      url: "https://techcorp.com/jobs/123",
      salary: "$120,000 - $150,000",
      description: "We are looking for a skilled software engineer.",

      easy_apply: true,
      active_hiring: true,

      platform: "linkedin",
      employment_type: "full_time",
      work_mode: "remote",

      posted_at: "2024-06-01T12:00:00Z",
    });
  });
});
