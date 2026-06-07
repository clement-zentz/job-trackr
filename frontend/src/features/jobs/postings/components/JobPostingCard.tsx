// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.tsx

import type { JobPostingListItemRead } from "../types";
import { formatDate, formatUrlForDisplay } from "./utils";

export function JobPostingCard({ job }: { job: JobPostingListItemRead }) {
  const formattedDate = job.posted_at ? formatDate(job.posted_at) : null;
  const formattedUrl = job.url ? formatUrlForDisplay(job.url) : null;

  return (
    <div className="p-4 border rounded-xl shadow-sm space-y-2">
      <h2 className="font-semibold">{job.title}</h2>

      <p className="text-gray-500">{job.company}</p>

      <p>{job.location}</p>

      <p className="text-gray-500">{job.platform_label}</p>

      {formattedUrl && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          title={job.url}
          data-testid="job-posting-url"
          className="inline-block max-w-full truncate rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {formattedUrl}
        </a>
      )}

      {formattedDate && (
        <p data-testid="job-posting-date" className="text-sm text-gray-500">
          {formattedDate}
        </p>
      )}
    </div>
  );
}
