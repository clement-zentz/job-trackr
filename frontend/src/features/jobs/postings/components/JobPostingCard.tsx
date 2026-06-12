// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.tsx

import type { JobPostingListItemRead } from "../types";
import { formatDateTimeForDisplay, formatUrlForDisplay } from "./utils";

interface JobPostingCardProps {
  job: JobPostingListItemRead;
}

export function JobPostingCard({ job }: JobPostingCardProps) {
  const formattedDate = job.posted_at
    ? formatDateTimeForDisplay(job.posted_at)
    : null;
  const formattedUrl = job.url ? formatUrlForDisplay(job.url) : null;

  return (
    <div className="p-4 border rounded-xl shadow-sm space-y-2">
      <h2 className="font-semibold">{job.title}</h2>

      <p className="text-gray-500">{job.company}</p>

      <p>{job.location}</p>

      <p className="text-gray-500">{job.platform_label}</p>

      {formattedUrl && (
        <p title={job.url} data-testid="job-posting-url">
          {formattedUrl}
        </p>
      )}

      {formattedDate && (
        <p data-testid="job-posting-date" className="text-sm text-gray-500">
          {formattedDate}
        </p>
      )}
    </div>
  );
}
