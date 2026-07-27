// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/JobCandidacyListPage.tsx

import { useState } from "react";

import { JobCandidacyList } from "../components/list/JobCandidacyList";
import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../constants";

export function JobCandidacyListPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Job Candidacies</h1>
        <p className="mt-1 text-gray-600">
          Track your applications and their current status.
        </p>
      </header>

      <JobCandidacyList
        params={{
          page,
          pageSize: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
