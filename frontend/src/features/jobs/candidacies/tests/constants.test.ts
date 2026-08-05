// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/constants.test.ts

import { describe, expect, it } from "vitest";

import {
  getJobCandidacyCreatePath,
  getJobCandidacyDetailPath,
  JOB_CANDIDACIES_LIST_PATH,
  JOB_CANDIDACY_CREATE_PATH,
  JOB_CANDIDACY_DETAIL_PATH,
} from "../constants";

describe("job candidacy constants", () => {
  it("defines the candidacies list path", () => {
    expect(JOB_CANDIDACIES_LIST_PATH).toBe("/jobs/candidacies");
  });

  it("defines the candidacy detail path", () => {
    expect(JOB_CANDIDACY_DETAIL_PATH).toBe("/jobs/candidacies/:candidacyId");
  });

  it("creates a candidacy detail path", () => {
    expect(getJobCandidacyDetailPath("candidacy-1")).toBe(
      "/jobs/candidacies/candidacy-1",
    );
  });

  it("defines the candidacy create path", () => {
    expect(JOB_CANDIDACY_CREATE_PATH).toBe("/jobs/candidacies/new");
  });

  it("creates a candidacy creation path for a job posting", () => {
    expect(getJobCandidacyCreatePath("job-posting-1")).toBe(
      "/jobs/candidacies/new?jobPostingId=job-posting-1",
    );
  });

  it("encodes the job posting id in the creation path", () => {
    expect(getJobCandidacyCreatePath("job posting/1")).toBe(
      "/jobs/candidacies/new?jobPostingId=job+posting%2F1",
    );
  });
});
