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

  it("maps frontend pagination parameters to API parameters", () => {
    expect(
      normalizeJobCandidacyParams({
        page: 3,
        pageSize: 25,
      }),
    ).toEqual({
      page: 3,
      page_size: 25,
    });
  });

  it("uses the default page size when only the page is provided", () => {
    expect(
      normalizeJobCandidacyParams({
        page: 4,
      }),
    ).toEqual({
      page: 4,
      page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
    });
  });

  it("uses the default page when only the page size is provided", () => {
    expect(
      normalizeJobCandidacyParams({
        pageSize: 50,
      }),
    ).toEqual({
      page: 1,
      page_size: 50,
    });
  });
});
