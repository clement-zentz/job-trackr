// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingListPage.tsx

import { Link } from "react-router-dom";

import { JobPostingFilters } from "../components/list/JobPostingFilters";
import { JobPostingList } from "../components/list/JobPostingList";
import { useJobPostingFilters } from "../hooks/useJobPostingFilters";

const createJobPostingLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2
`.trim();

export function JobPostingListPage() {
  const { filters, page, pageSize, setPage, updateFilter, resetFilters } =
    useJobPostingFilters();

  const params = {
    ...filters,
    page,
    pageSize,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Postings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage tracked job postings and their details.
          </p>
        </div>

        <Link to="new" className={createJobPostingLinkClassName}>
          Create job posting
        </Link>
      </div>

      <JobPostingFilters
        params={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <JobPostingList params={params} onPageChange={setPage} />
    </div>
  );
}
