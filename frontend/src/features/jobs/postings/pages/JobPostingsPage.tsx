// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingsPage.tsx

import { useState } from "react";
import { JobPostingList } from "../components/JobPostingList";

export function JobPostingsPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Job Postings</h1>

      <JobPostingList page={page} onPageChange={setPage} />
    </div>
  );
}
