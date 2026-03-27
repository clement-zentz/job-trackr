// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.tsx

import type { JobPosting } from "../types";

function formatDate(dateString: string | null) {
  if (!dateString) return "Posting date unknown";

  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobPostingCard({ job }: { job: JobPosting }) {
  return (
    <div className="p-4 border rounded-xl shadow-sm">
      <h2 className="font-semibold">{job.title}</h2>
      <p>{job.company}</p>
      <p className="text-sm text-gray-500">
        {job.location ?? "Location unknown"}
      </p>
      <p>{job.platform}</p>
      <p className="text-sm text-gray-500">{formatDate(job.posted_at)}</p>
    </div>
  );
}
