// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/JobCandidacyListPage.tsx

import { JobCandidacyFilters } from "../components/list/JobCandidacyFilters";
import { JobCandidacyList } from "../components/list/JobCandidacyList";
import { useJobCandidacyFilters } from "../hooks/useJobCandidacyFilters";

export function JobCandidacyListPage() {
  const { filters, page, setPage, updateFilter, resetFilters } =
    useJobCandidacyFilters();

  const listParams = {
    ...filters,
    page,
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Job Candidacies</h1>

        <p className="mt-1 text-gray-600">
          Track your applications and their current status.
        </p>
      </header>

      <JobCandidacyFilters
        params={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <JobCandidacyList params={listParams} onPageChange={setPage} />
    </div>
  );
}
