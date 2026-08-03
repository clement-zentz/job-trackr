// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingListPage.tsx

import { CreateJobPostingLink } from "../components/actions";
import { JobPostingFilters } from "../components/list/JobPostingFilters";
import { JobPostingList } from "../components/list/JobPostingList";
import { useJobPostingFilters } from "../hooks/useJobPostingFilters";

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

        <CreateJobPostingLink />
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
