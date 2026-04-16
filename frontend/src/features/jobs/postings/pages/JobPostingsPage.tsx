// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingsPage.tsx

import { JobPostingList } from "../components/JobPostingList";
import { JobPostingFilters } from "../components/JobPostingFilters";
import { useJobPostingFilters } from "../hooks/useJobPostingFilters";

export function JobPostingsPage() {
  const { params, updateParam, resetFilters } = useJobPostingFilters();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Job Postings</h1>

      <JobPostingFilters
        params={params}
        updateParam={updateParam}
        resetFilters={resetFilters}
      />

      <JobPostingList
        params={params}
        onPageChange={(page) => updateParam("page", page)}
      />
    </div>
  );
}
