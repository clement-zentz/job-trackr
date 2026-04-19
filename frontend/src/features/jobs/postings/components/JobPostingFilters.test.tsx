// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingFilters.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { JobPostingFilters } from "./JobPostingFilters";
import type { JobPostingFilters as Filters } from "../types";

const defaultParams: Filters = {
  ordering: "-posted_at",
};

describe("JobPostingFilters", () => {
  it("updates search input", () => {
    const updateFilter = vi.fn();

    render(
      <JobPostingFilters
        params={defaultParams}
        updateFilter={updateFilter}
        resetFilters={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search jobs/i), {
      target: { value: "python" },
    });

    expect(updateFilter).toHaveBeenCalledWith("search", "python");
  });

  it("updates platform filter", () => {
    const updateFilter = vi.fn();

    render(
      <JobPostingFilters
        params={defaultParams}
        updateFilter={updateFilter}
        resetFilters={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("All platforms"), {
      target: { value: "linkedin" },
    });

    expect(updateFilter).toHaveBeenCalledWith("platform", "linkedin");
  });

  it("update boolean filters", () => {
    const updateFilter = vi.fn();

    render(
      <JobPostingFilters
        params={defaultParams}
        updateFilter={updateFilter}
        resetFilters={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue(/easy apply/i), {
      target: { value: "true" },
    });

    expect(updateFilter).toHaveBeenCalledWith("easyApply", true);
  });

  it("calls resetFilters when reset button is clicked", () => {
    const resetFilters = vi.fn();

    render(
      <JobPostingFilters
        params={defaultParams}
        updateFilter={vi.fn()}
        resetFilters={resetFilters}
      />,
    );

    fireEvent.click(screen.getByText(/reset filters/i));

    expect(resetFilters).toHaveBeenCalled();
  });
});
