// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useJobCandidacyFilters.test.ts

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useJobCandidacyFilters } from "../useJobCandidacyFilters";

describe("useJobCandidacyFilters", () => {
  it("uses the default filters and pagination", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.page).toBe(1);
  });

  it("updates the current page", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.page).toBe(3);
  });

  it("updates a filter and resets the current page", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    act(() => {
      result.current.setPage(3);
    });

    act(() => {
      result.current.updateFilter("search", "frontend developer");
    });

    expect(result.current.filters).toEqual({
      search: "frontend developer",
    });
    expect(result.current.page).toBe(1);
  });

  it("preserves existing filters when updating another filter", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    act(() => {
      result.current.updateFilter("search", "frontend developer");
    });

    act(() => {
      result.current.updateFilter("ordering", "-applied_on");
    });

    expect(result.current.filters).toEqual({
      search: "frontend developer",
      ordering: "-applied_on",
    });
  });

  it("updates an existing filter", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    act(() => {
      result.current.updateFilter("search", "frontend developer");
    });

    act(() => {
      result.current.updateFilter("search", "backend developer");
    });

    expect(result.current.filters).toEqual({
      search: "backend developer",
    });
  });

  it.each([undefined, "", "   "])(
    "removes a filter when its value is %p",
    (emptyValue) => {
      const { result } = renderHook(() => useJobCandidacyFilters());

      act(() => {
        result.current.updateFilter("search", "frontend developer");
        result.current.updateFilter("ordering", "-applied_on");
      });

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.updateFilter("search", emptyValue);
      });

      expect(result.current.filters).toEqual({
        ordering: "-applied_on",
      });
      expect(result.current.page).toBe(1);
    },
  );

  it("resets the filters and current page", () => {
    const { result } = renderHook(() => useJobCandidacyFilters());

    act(() => {
      result.current.updateFilter("search", "frontend developer");
      result.current.updateFilter("ordering", "-applied_on");
    });

    act(() => {
      result.current.setPage(3);
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({});
    expect(result.current.page).toBe(1);
  });
});
