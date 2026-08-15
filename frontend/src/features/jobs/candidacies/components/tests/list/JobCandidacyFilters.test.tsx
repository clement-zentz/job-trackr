// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/list/JobCandidacyFilters.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { JobCandidacyFilters as JobCandidacyFiltersParams } from "../../../types";
import { JobCandidacyFilters } from "../../list/JobCandidacyFilters";

function renderFilters(params: JobCandidacyFiltersParams = {}) {
  const updateFilter = vi.fn();
  const resetFilters = vi.fn();

  render(
    <JobCandidacyFilters
      params={params}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
    />,
  );

  return {
    updateFilter,
    resetFilters,
  };
}

describe("JobCandidacyFilters", () => {
  it("renders the current filter values", () => {
    renderFilters({
      search: "backend",
      status: "interview",
      platform: "indeed",
      employmentType: "full_time",
      workMode: "remote",
      ordering: "-applied_on",
      appliedOnAfter: "2026-07-01",
      appliedOnBefore: "2026-08-15",
    });

    expect(
      screen.getByRole("group", { name: "Job candidacy filters" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("searchbox", { name: "Search candidacies" }),
    ).toHaveValue("backend");

    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue(
      "interview",
    );
    expect(screen.getByRole("combobox", { name: "Platform" })).toHaveValue(
      "indeed",
    );
    expect(
      screen.getByRole("combobox", { name: "Employment type" }),
    ).toHaveValue("full_time");
    expect(screen.getByRole("combobox", { name: "Work mode" })).toHaveValue(
      "remote",
    );
    expect(screen.getByRole("combobox", { name: "Sort order" })).toHaveValue(
      "-applied_on",
    );

    expect(screen.getByLabelText("Applied after")).toHaveValue("2026-07-01");
    expect(screen.getByLabelText("Applied before")).toHaveValue("2026-08-15");
  });

  it("renders empty values when filters are not set", () => {
    renderFilters();

    expect(
      screen.getByRole("searchbox", { name: "Search candidacies" }),
    ).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Platform" })).toHaveValue("");
    expect(
      screen.getByRole("combobox", { name: "Employment type" }),
    ).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Work mode" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Sort order" })).toHaveValue(
      "",
    );
    expect(screen.getByLabelText("Applied after")).toHaveValue("");
    expect(screen.getByLabelText("Applied before")).toHaveValue("");
  });

  it("updates the search filter", () => {
    const { updateFilter } = renderFilters();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search candidacies" }),
      {
        target: { value: "frontend developer" },
      },
    );

    expect(updateFilter).toHaveBeenCalledOnce();
    expect(updateFilter).toHaveBeenCalledWith("search", "frontend developer");
  });

  it("clears the search filter with an empty string", () => {
    const { updateFilter } = renderFilters({
      search: "backend",
    });

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search candidacies" }),
      {
        target: { value: "" },
      },
    );

    expect(updateFilter).toHaveBeenCalledOnce();
    expect(updateFilter).toHaveBeenCalledWith("search", "");
  });

  it.each([
    ["Status", "status", "interview"],
    ["Platform", "platform", "indeed"],
    ["Employment type", "employmentType", "part_time"],
    ["Work mode", "workMode", "remote"],
    ["Sort order", "ordering", "-created_at"],
  ])("updates the %s filter", (label, key, value) => {
    const { updateFilter } = renderFilters();

    fireEvent.change(screen.getByRole("combobox", { name: label }), {
      target: { value },
    });

    expect(updateFilter).toHaveBeenCalledOnce();
    expect(updateFilter).toHaveBeenCalledWith(key, value);
  });

  const clearFilterCases = [
    ["Status", "status", { status: "interview" }],
    ["Platform", "platform", { platform: "indeed" }],
    ["Employment type", "employmentType", { employmentType: "part_time" }],
    ["Work mode", "workMode", { workMode: "remote" }],
    ["Sort order", "ordering", { ordering: "-created_at" }],
  ] satisfies Array<
    [string, keyof JobCandidacyFiltersParams, JobCandidacyFiltersParams]
  >;

  it.each(clearFilterCases)(
    "clears the %s filter with undefined",
    (label, key, params) => {
      const { updateFilter } = renderFilters(params);

      fireEvent.change(screen.getByRole("combobox", { name: label }), {
        target: { value: "" },
      });

      expect(updateFilter).toHaveBeenCalledOnce();
      expect(updateFilter).toHaveBeenCalledWith(key, undefined);
    },
  );

  it("updates the applied-after filter", () => {
    const { updateFilter } = renderFilters();

    fireEvent.change(screen.getByLabelText("Applied after"), {
      target: { value: "2026-07-01" },
    });

    expect(updateFilter).toHaveBeenCalledOnce();
    expect(updateFilter).toHaveBeenCalledWith("appliedOnAfter", "2026-07-01");
  });

  it("updates the applied-before filter", () => {
    const { updateFilter } = renderFilters();

    fireEvent.change(screen.getByLabelText("Applied before"), {
      target: { value: "2026-08-15" },
    });

    expect(updateFilter).toHaveBeenCalledOnce();
    expect(updateFilter).toHaveBeenCalledWith("appliedOnBefore", "2026-08-15");
  });

  const clearDateFilterCases = [
    ["Applied after", "appliedOnAfter", { appliedOnAfter: "2026-07-01" }],
    ["Applied before", "appliedOnBefore", { appliedOnBefore: "2026-08-15" }],
  ] satisfies Array<
    [string, keyof JobCandidacyFiltersParams, JobCandidacyFiltersParams]
  >;

  it.each(clearDateFilterCases)(
    "clears the %s filter with undefined",
    (label, key, params) => {
      const { updateFilter } = renderFilters(params);

      fireEvent.change(screen.getByLabelText(label), {
        target: { value: "" },
      });

      expect(updateFilter).toHaveBeenCalledOnce();
      expect(updateFilter).toHaveBeenCalledWith(key, undefined);
    },
  );

  it("resets the filters", () => {
    const { updateFilter, resetFilters } = renderFilters();

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(resetFilters).toHaveBeenCalledOnce();
    expect(updateFilter).not.toHaveBeenCalled();
  });
});
