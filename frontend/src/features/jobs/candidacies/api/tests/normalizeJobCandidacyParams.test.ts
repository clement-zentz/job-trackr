// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/tests/normalizeJobCandidacyParams.test.ts

import { describe, expect, it } from "vitest";

import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../../constants";
import { normalizeJobCandidacyParams } from "../normalizeJobCandidacyParams";

describe("normalizeJobCandidacyParams", () => {
  it("returns the default pagination parameters", () => {
    expect(normalizeJobCandidacyParams()).toEqual({
      page: 1,
      page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
    });
  });

  it("uses the fixed candidacy page size", () => {
    expect(
      normalizeJobCandidacyParams({
        page: 4,
      }),
    ).toEqual({
      page: 4,
      page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
    });
  });
});
