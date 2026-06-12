// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingDetail.tsx

import type { JobPostingDetailRead } from "../types";
import { formatDateTimeForDisplay, formatUrlForDisplay } from "./utils";

const dtClassName = "text-sm font-medium text-gray-500";
const ddClassName = "mt-1 text-sm text-gray-900";

type JobPostingDetailProps = {
  jobPosting: JobPostingDetailRead;
};

export function JobPostingDetail({ jobPosting }: JobPostingDetailProps) {
  const formattedDate = jobPosting.posted_at
    ? formatDateTimeForDisplay(jobPosting.posted_at)
    : null;

  const formattedUrl = jobPosting.url
    ? formatUrlForDisplay(jobPosting.url)
    : null;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <header className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          {jobPosting.title}
        </h2>

        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p className="font-medium text-gray-700">{jobPosting.company}</p>
          <p className="font-medium text-gray-700">{jobPosting.location}</p>
        </div>
      </header>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {formattedUrl && (
          <div>
            <dt className={dtClassName}>URL</dt>
            <dd className="mt-1">
              <a
                href={jobPosting.url}
                target="_blank"
                rel="noopener noreferrer"
                title={jobPosting.url}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                {formattedUrl}
              </a>
            </dd>
          </div>
        )}

        {jobPosting.salary && (
          <div>
            <dt className={dtClassName}>Salary</dt>
            <dd className={ddClassName}>{jobPosting.salary}</dd>
          </div>
        )}

        <div>
          <dt className={dtClassName}>Platform</dt>
          <dd className={ddClassName}>{jobPosting.platform_label}</dd>
        </div>

        <div>
          <dt className={dtClassName}>Employment type</dt>
          <dd className={ddClassName}>{jobPosting.employment_type_label}</dd>
        </div>

        <div>
          <dt className={dtClassName}>Work mode</dt>
          <dd className={ddClassName}>{jobPosting.work_mode_label}</dd>
        </div>

        <div>
          <dt className={dtClassName}>Easy apply</dt>
          <dd className={ddClassName}>
            {jobPosting.easy_apply ? "Yes" : "No"}
          </dd>
        </div>

        <div>
          <dt className={dtClassName}>Active hiring</dt>
          <dd className={ddClassName}>
            {jobPosting.active_hiring ? "Yes" : "No"}
          </dd>
        </div>

        {formattedDate && (
          <div>
            <dt className={dtClassName}>Posted at</dt>
            <dd className={ddClassName}>{formattedDate}</dd>
          </div>
        )}
      </dl>

      {jobPosting.description && (
        <section className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
            {jobPosting.description}
          </p>
        </section>
      )}
    </article>
  );
}
