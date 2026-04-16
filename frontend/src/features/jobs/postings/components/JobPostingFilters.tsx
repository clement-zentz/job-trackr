// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingFilters.tsx

import type { JobPostingFilters } from "../hooks/useJobPostingFilters";

interface JobPostingFiltersProps {
  params: JobPostingFilters;
  updateParam: <K extends keyof JobPostingFilters>(
    key: K,
    value: JobPostingFilters[K],
  ) => void;
  resetFilters: () => void;
}

export function JobPostingFilters({
  params,
  updateParam,
  resetFilters,
}: JobPostingFiltersProps) {
  return (
    <div className="mb-6 space-y-4 border p-4 rounded">
      {/* 🔍 Search */}
      <div>
        <input
          type="text"
          placeholder="Search jobs..."
          value={params.search ?? ""}
          onChange={(e) => updateParam("search", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {/* 📍 Filters row */}
      <div className="flex gap-4 flex-wrap">
        {/* Platform */}
        <select
          value={params.platform ?? ""}
          onChange={(e) => updateParam("platform", e.target.value || undefined)}
          className="rounded border px-3 py-2"
        >
          <option value="">All platforms</option>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
        </select>

        {/* Easy apply */}
        <select
          value={
            params.easy_apply === undefined
              ? ""
              : params.easy_apply
                ? "true"
                : "false"
          }
          onChange={(e) =>
            updateParam(
              "easy_apply",
              e.target.value === "" ? undefined : e.target.value === "true",
            )
          }
          className="rounded border px-3 py-2"
        >
          <option value="">Easy apply: All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        {/* Active hiring */}
        <select
          value={
            params.active_hiring === undefined
              ? ""
              : params.active_hiring
                ? "true"
                : "false"
          }
          onChange={(e) =>
            updateParam(
              "active_hiring",
              e.target.value === "" ? undefined : e.target.value === "true",
            )
          }
          className="rounded border px-3 py-2"
        >
          <option value="">Active hiring: All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        {/* Ordering */}
        <select
          value={params.ordering ?? "-posted_at"}
          onChange={(e) => updateParam("ordering", e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="-posted_at">Newest</option>
          <option value="posted_at">Oldest</option>
          <option value="company">Company A-Z</option>
          <option value="-company">Company Z-A</option>
          <option value="-rating">Top rated</option>
        </select>

        {/* 🔄 Reset */}
        <div>
          <button onClick={resetFilters} className="text-sm underline">
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );
}
