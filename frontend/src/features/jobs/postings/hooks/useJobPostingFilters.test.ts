// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostingFilters.test.ts

import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useJobPostingFilters } from "./useJobPostingFilters";
import { act } from "react";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

describe("useJobPostingFilters", () => {
  it("initializes with default filters", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    expect(result.current.filters).toEqual({
      ordering: "-posted_at",
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(DEFAULT_JOB_POSTINGS_PAGE_SIZE);
  });

  it("updates a filter and resets page", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    // Move to another page first
    act(() => {
      result.current.setPage(3);
    });

    // Update a filter
    act(() => {
      result.current.updateFilter("search", "python");
    });

    expect(result.current.filters).toMatchObject({
      search: "python",
    });

    expect(result.current.page).toBe(1); // reset
  });

  it("updates page without affecting filters", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.page).toBe(3);
    expect(result.current.filters).toEqual({
      ordering: "-posted_at",
    });
  });

  it("update boolean filters correctly", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateFilter("easy_apply", true);
    });

    expect(result.current.filters.easy_apply).toBe(true);
  });

  it("reset filters and page", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateFilter("search", "python");
      result.current.setPage(3);
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      ordering: "-posted_at",
    });

    expect(result.current.page).toBe(1);
  });
});
