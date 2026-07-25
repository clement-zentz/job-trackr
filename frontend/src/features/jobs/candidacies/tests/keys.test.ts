// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/keys.test.ts

import { describe, expect, it } from "vitest";

import { jobCandidaciesKeys } from "../keys";

describe("jobCandidaciesKeys", () => {
  it("returns the root candidacy key", () => {
    expect(jobCandidaciesKeys.all).toEqual(["job-candidacies"]);
  });

  it("returns the candidacy lists key", () => {
    expect(jobCandidaciesKeys.lists()).toEqual(["job-candidacies", "list"]);
  });

  it("returns a key for a specific list query", () => {
    const params = {
      page: 2,
      page_size: 25,
    };

    expect(jobCandidaciesKeys.list(params)).toEqual([
      "job-candidacies",
      "list",
      params,
    ]);
  });
});
