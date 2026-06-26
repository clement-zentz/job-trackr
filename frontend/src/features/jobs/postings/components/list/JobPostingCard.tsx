// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/list/JobPostingCard.tsx

import type { JobPostingListItemRead } from "../../types";
import { formatDateTimeForDisplay, formatUrlForDisplay } from "../utils";

const dtClassName = "font-medium text-gray-700";
const ddClassName = "text-gray-600";

interface JobPostingCardProps {
  job: JobPostingListItemRead;
}

export function JobPostingCard({ job }: JobPostingCardProps) {
  const postedAt = job.posted_at?.trim() || null;
  const salary = job.salary.trim();
  const descriptionPreview = job.description_preview.trim();
  const url = job.url.trim();

  const formattedPostedAt = postedAt
    ? formatDateTimeForDisplay(postedAt)
    : null;

  const formattedCreatedAt = formatDateTimeForDisplay(job.created_at);
  const formattedUpdatedAt = formatDateTimeForDisplay(job.updated_at);

  const formattedUrl = url ? formatUrlForDisplay(url) : null;

  const badges = [
    { key: "platform", label: job.platform_label },
    { key: "employment_type", label: job.employment_type_label },
    { key: "work_mode", label: job.work_mode_label },
    { key: "easy_apply", label: job.easy_apply ? "Easy Apply" : null },
    { key: "active_hiring", label: job.active_hiring ? "Active Hiring" : null },
    { key: "candidacy", label: job.candidacy_id ? "Applied" : null },
  ]
    .map(({ key, label }) => ({
      key,
      label: label?.trim() ?? "",
    }))
    .filter((badge) => badge.label.length > 0);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>

        <p className="text-sm text-gray-600">
          {job.company} &middot; {job.location}
        </p>
      </header>

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={`${job.id}-${badge.key}`}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        {salary && (
          <div>
            <dt className={dtClassName}>Salary</dt>
            <dd className={ddClassName}>{salary}</dd>
          </div>
        )}

        {formattedUrl && (
          <div>
            <dt className={dtClassName}>URL</dt>
            <dd
              title={url}
              data-testid="job-posting-url"
              className={ddClassName}
            >
              {formattedUrl}
            </dd>
          </div>
        )}

        {descriptionPreview && (
          <div>
            <dt className={dtClassName}>Description</dt>
            <dd className={ddClassName}>{descriptionPreview}</dd>
          </div>
        )}

        {formattedPostedAt && (
          <div>
            <dt className={dtClassName}>Posted at</dt>
            <dd data-testid="posted-at" className={ddClassName}>
              {formattedPostedAt}
            </dd>
          </div>
        )}
      </dl>

      <footer className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <p>
          Created at:{" "}
          <time dateTime={job.created_at}>{formattedCreatedAt}</time>
        </p>
        <p>
          Updated at:{" "}
          <time dateTime={job.updated_at}>{formattedUpdatedAt}</time>
        </p>
      </footer>
    </article>
  );
}
