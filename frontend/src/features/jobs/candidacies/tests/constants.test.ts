// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/constants.test.ts

import { describe, expect, it } from "vitest";

import { getJobCandidacyDetailPath } from "../constants";

describe("getJobCandidacyDetailPath", () => {
  it("returns the candidacy detail path", () => {
    expect(getJobCandidacyDetailPath("candidacy-1")).toBe(
      "/jobs/candidacies/candidacy-1",
    );
  });
});
