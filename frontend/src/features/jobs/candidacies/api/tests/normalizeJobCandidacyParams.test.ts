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

  it("removes undefined and empty string values", () => {
    const result = normalizeJobCandidacyParams({
      search: "",
      status: undefined,
    });

    expect(result).toEqual({
      page: 1,
      page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
    });
  });

  it("trims search values", () => {
    const result = normalizeJobCandidacyParams({
      search: "  frontend developer  ",
    });

    expect(result).toMatchObject({
      search: "frontend developer",
    });
  });

  it("preserves ordering", () => {
    const result = normalizeJobCandidacyParams({
      ordering: "-applied_on",
    });

    expect(result).toMatchObject({
      ordering: "-applied_on",
    });
  });

  it("removes search values that become empty after trimming", () => {
    const result = normalizeJobCandidacyParams({
      search: "   ",
    });

    expect(result.search).toBeUndefined();
  });

  it("maps camelCase filter parameters to API parameters", () => {
    const result = normalizeJobCandidacyParams({
      appliedOnAfter: "2026-01-01",
      appliedOnBefore: "2026-08-12",
      employmentType: "full_time",
      workMode: "remote",
    });

    expect(result).toMatchObject({
      applied_on_after: "2026-01-01",
      applied_on_before: "2026-08-12",
      employment_type: "full_time",
      work_mode: "remote",
    });

    expect("appliedOnAfter" in result).toBe(false);
    expect("appliedOnBefore" in result).toBe(false);
    expect("employmentType" in result).toBe(false);
    expect("workMode" in result).toBe(false);
  });

  it("preserves filters that already use API-compatible names", () => {
    const result = normalizeJobCandidacyParams({
      search: "python",
      status: "interview",
      platform: "linkedin",
      ordering: "-applied_on",
    });

    expect(result).toMatchObject({
      search: "python",
      status: "interview",
      platform: "linkedin",
      ordering: "-applied_on",
    });
  });

  it("normalizes filters and pagination together", () => {
    expect(
      normalizeJobCandidacyParams({
        page: 2,
        search: "  django  ",
        status: "applied",
        appliedOnAfter: "2026-06-01",
        appliedOnBefore: "2026-08-01",
        platform: "linkedin",
        employmentType: "full_time",
        workMode: "hybrid",
        ordering: "-applied_on",
      }),
    ).toEqual({
      search: "django",
      status: "applied",
      platform: "linkedin",
      ordering: "-applied_on",
      applied_on_after: "2026-06-01",
      applied_on_before: "2026-08-01",
      employment_type: "full_time",
      work_mode: "hybrid",
      page: 2,
      page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
    });
  });
});
