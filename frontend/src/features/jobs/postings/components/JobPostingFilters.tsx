// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingFilters.tsx

import type { JobPostingFilters } from "../types";

interface JobPostingFiltersProps {
  params: JobPostingFilters;
  updateFilter: <K extends keyof JobPostingFilters>(
    key: K,
    value: JobPostingFilters[K],
  ) => void;
  resetFilters: () => void;
}

export function JobPostingFilters({
  params,
  updateFilter,
  resetFilters,
}: JobPostingFiltersProps) {
  return (
    <fieldset className="mb-6 space-y-4 border p-4 rounded">
      {/* Accessible group label */}
      <legend className="sr-only">Job filters</legend>

      {/* 🔍 Search */}
      <div>
        <label htmlFor="search" className="sr-only">
          Search jobs
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search jobs..."
          value={params.search ?? ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {/* 📍 Filters row */}
      <div className="flex gap-4 flex-wrap">
        {/* Platform */}
        <div>
          <label htmlFor="platform" className="sr-only">
            Platform
          </label>
          <select
            id="platform"
            value={params.platform ?? ""}
            onChange={(e) =>
              updateFilter("platform", e.target.value || undefined)
            }
            className="rounded border px-3 py-2"
          >
            <option value="">All platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
          </select>
        </div>

        {/* Easy apply */}
        <div>
          <label htmlFor="easyApply" className="sr-only">
            Easy apply
          </label>
          <select
            id="easyApply"
            value={
              params.easyApply === undefined
                ? ""
                : params.easyApply
                  ? "true"
                  : "false"
            }
            onChange={(e) =>
              updateFilter(
                "easyApply",
                e.target.value === "" ? undefined : e.target.value === "true",
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Easy apply: All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Active hiring */}
        <div>
          <label htmlFor="activeHiring" className="sr-only">
            Active hiring
          </label>
          <select
            id="activeHiring"
            value={
              params.activeHiring === undefined
                ? ""
                : params.activeHiring
                  ? "true"
                  : "false"
            }
            onChange={(e) =>
              updateFilter(
                "activeHiring",
                e.target.value === "" ? undefined : e.target.value === "true",
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Active hiring: All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Ordering */}
        <div>
          <label htmlFor="ordering" className="sr-only">
            Sort order
          </label>
          <select
            id="ordering"
            value={params.ordering ?? ""}
            onChange={(e) =>
              updateFilter("ordering", e.target.value || undefined)
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Default</option>
            <option value="-posted_at">Newest</option>
            <option value="posted_at">Oldest</option>
            <option value="company">Company A-Z</option>
            <option value="-company">Company Z-A</option>
            <option value="-rating">Top rated</option>
          </select>
        </div>

        {/* 🔄 Reset */}
        <div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm underline"
          >
            Reset filters
          </button>
        </div>
      </div>
    </fieldset>
  );
}
