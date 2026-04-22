// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/normalizeJobPostingParams.test.ts

import { describe, it, expect } from "vitest";
import { normalizeJobPostingParams } from "./normalizeJobPostingParams";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

describe("normalizeJobPostingParams", () => {
  it("applies default pagination when params are empty", () => {
    const result = normalizeJobPostingParams();

    expect(result).toEqual({
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    });
  });

  it("preserves provided pagination values", () => {
    const result = normalizeJobPostingParams({
      page: 3,
      pageSize: 50,
    });

    expect(result).toMatchObject({
      page: 3,
      page_size: 50,
    });
  });

  it("removes undefined and empty string values", () => {
    const result = normalizeJobPostingParams({
      search: "",
      company: undefined,
      location: "Paris",
    });

    expect(result).toMatchObject({
      location: "Paris",
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    });

    expect(result.search).toBeUndefined();
    expect(result.company).toBeUndefined();
  });

  it("trims string values before applying filters", () => {
    const result = normalizeJobPostingParams({
      search: "  python  ",
      company: "  OpenAI  ",
    });

    expect(result).toMatchObject({
      search: "python",
      company: "OpenAI",
    });
  });

  it("removes values that become empty after trimming", () => {
    const result = normalizeJobPostingParams({
      search: "   ",
    });

    expect(result.search).toBeUndefined();
  });

  it("maps camelCase fields to snake_case", () => {
    const result = normalizeJobPostingParams({
      easyApply: true,
      activeHiring: false,
    });

    expect(result).toMatchObject({
      easy_apply: true,
      active_hiring: false,
    });

    // Ensure camelCase keys are not present
    expect("easyApply" in result).toBe(false);
    expect("activeHiring" in result).toBe(false);
  });

  it("preserves other valid filters", () => {
    const result = normalizeJobPostingParams({
      search: "python",
      platform: "linkedin",
      ordering: "-posted_at",
    });

    expect(result).toMatchObject({
      search: "python",
      platform: "linkedin",
      ordering: "-posted_at",
    });
  });

  it("only includes normalized and allowed keys", () => {
    const result = normalizeJobPostingParams({
      search: "python",
    });

    // Only expected keys should exist
    expect(Object.keys(result).sort()).toEqual(
      ["search", "page", "page_size"].sort(),
    );
  });
});
