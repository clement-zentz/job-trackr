// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingDetailPage.tsx

import { Link, useParams } from "react-router-dom";
import { JobPostingDetail } from "../components/JobPostingDetail";
import { useJobPosting } from "../hooks/useJobPosting";

const pageTitle = "Job Posting Detail";
const backLinkLabel = "Back to job postings";

const mainClassName = "mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8";
const h1ClassName = "text-2xl font-semibold text-gray-900";
const pClassName = "mt-3 text-sm";

const linkClassName = `
  text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline
`.trim();

export function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobPostingQuery = useJobPosting(id);

  if (jobPostingQuery.isLoading) {
    return (
      <main className={mainClassName}>
        <h1 className={h1ClassName}>{pageTitle}</h1>
        <p className={`${pClassName} text-gray-600`}>Loading job posting...</p>
      </main>
    );
  }

  if (jobPostingQuery.isError) {
    return (
      <main className={mainClassName}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className={h1ClassName}>{pageTitle}</h1>

          <p className={`${pClassName} text-red-700`}>
            Could not load job posting.
          </p>

          <Link to=".." className={`mt-6 inline-flex ${linkClassName}`}>
            {backLinkLabel}
          </Link>
        </div>
      </main>
    );
  }

  if (!jobPostingQuery.data) {
    return (
      <main className={mainClassName}>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className={h1ClassName}>{pageTitle}</h1>

          <p className={`${pClassName} text-gray-600`}>
            Job posting not found.
          </p>

          <Link to=".." className={`mt-6 inline-flex ${linkClassName}`}>
            {backLinkLabel}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={mainClassName}>
      <div className="mb-6">
        <Link to=".." className={linkClassName}>
          {backLinkLabel}
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          {pageTitle}
        </h1>
      </div>

      <JobPostingDetail jobPosting={jobPostingQuery.data} />
    </main>
  );
}
