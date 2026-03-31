// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.tsx

import type { JobPosting } from "../types";

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;

  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobPostingCard({ job }: { job: JobPosting }) {
  const formattedDate = formatDate(job.posted_at);

  return (
    <div className="p-4 border rounded-xl shadow-sm">
      <h2 className="font-semibold">{job.title}</h2>

      <p>{job.company}</p>

      <p className="text-sm text-gray-500">
        {job.location && job.location.trim()
          ? job.location
          : "Location unknown"}
      </p>

      <p>{job.platform}</p>

      {formattedDate && (
        <p data-testid="job-posting-date" className="text-sm text-gray-500">
          {formattedDate}
        </p>
      )}
    </div>
  );
}
