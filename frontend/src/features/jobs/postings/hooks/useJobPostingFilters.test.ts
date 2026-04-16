// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostingFilters.test.ts

import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useJobPostingFilters } from "./useJobPostingFilters";
import { act } from "react";

describe("useJobPostingFilters", () => {
  it("initializes with default filters", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    expect(result.current.params).toEqual({
      page: 1,
      pageSize: 10,
      ordering: "-posted_at",
    });
  });

  it("update a filter and resets page", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateParam("search", "python");
    });

    expect(result.current.params).toMatchObject({
      search: "python",
      page: 1, // reset
    });
  });

  it("does not reset page when updating page", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateParam("page", 3);
    });

    expect(result.current.params.page).toBe(3);
  });

  it("update boolean filters correctly", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateParam("easy_apply", true);
    });

    expect(result.current.params.easy_apply).toBe(true);
  });

  it("reset all filters", () => {
    const { result } = renderHook(() => useJobPostingFilters());

    act(() => {
      result.current.updateParam("search", "python");
      result.current.resetFilters();
    });

    expect(result.current.params).toEqual({
      page: 1,
      pageSize: 10,
      ordering: "-posted_at",
    });
  });
});
