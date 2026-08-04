// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/form/jobCandidacyFormMappers.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import type { JobCandidacyFormValues } from "@/features/jobs/candidacies/types";

import {
  createEmptyJobCandidacyFormValues,
  formValuesToCreatePayload,
} from "../../form/jobCandidacyFormMappers";

describe("createEmptyJobCandidacyFormValues", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the applied status, today's local date, and empty notes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 12));

    expect(createEmptyJobCandidacyFormValues()).toEqual({
      status: "applied",
      applied_on: "2026-01-05",
      notes: "",
    });
  });

  it("calculates the date each time it is called", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date(2026, 0, 5, 23, 59));
    const firstValues = createEmptyJobCandidacyFormValues();

    vi.setSystemTime(new Date(2026, 0, 6, 0, 1));
    const secondValues = createEmptyJobCandidacyFormValues();

    expect(firstValues.applied_on).toBe("2026-01-05");
    expect(secondValues.applied_on).toBe("2026-01-06");
  });
});

describe("formValuesToCreatePayload", () => {
  it("maps form values to a create payload and trims notes", () => {
    const values = {
      status: "interview",
      applied_on: "2026-08-03",
      notes: "  Prepare examples for the interview.  ",
    } satisfies JobCandidacyFormValues;

    expect(formValuesToCreatePayload("job-posting-1", values)).toEqual({
      job_posting: "job-posting-1",
      status: "interview",
      applied_on: "2026-08-03",
      notes: "Prepare examples for the interview.",
    });
  });
});
