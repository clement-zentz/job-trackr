// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/constants.test.ts

import { describe, expect, it } from "vitest";

import {
  getJobCandidacyCreatePath,
  getJobCandidacyDetailPath,
  getJobCandidacyEditPath,
  JOB_CANDIDACIES_LIST_PATH,
  JOB_CANDIDACY_CREATE_PATH,
  JOB_CANDIDACY_DETAIL_PATH,
  JOB_CANDIDACY_EDIT_PATH,
} from "../constants";

describe("job candidacy path constants", () => {
  it("defines the candidacies list path", () => {
    expect(JOB_CANDIDACIES_LIST_PATH).toBe("/jobs/candidacies");
  });

  it("defines the candidacy detail path", () => {
    expect(JOB_CANDIDACY_DETAIL_PATH).toBe("/jobs/candidacies/:candidacyId");
  });

  it("defines the candidacy create path", () => {
    expect(JOB_CANDIDACY_CREATE_PATH).toBe("/jobs/candidacies/new");
  });

  it("defines the candidacy edit route", () => {
    expect(JOB_CANDIDACY_EDIT_PATH).toBe("/jobs/candidacies/:candidacyId/edit");
  });
});

describe("job candidacy path helpers", () => {
  it("generates a candidacy detail path", () => {
    expect(getJobCandidacyDetailPath("candidacy-1")).toBe(
      "/jobs/candidacies/candidacy-1",
    );
  });

  describe("job candidacy creation path helper", () => {
    it("generates a candidacy creation path for a job posting", () => {
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

  it("generates the job candidacy edit path", () => {
    expect(getJobCandidacyEditPath("candidacy-123")).toBe(
      "/jobs/candidacies/candidacy-123/edit",
    );
  });
});
