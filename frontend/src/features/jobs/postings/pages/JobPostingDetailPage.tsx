// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingDetailPage.tsx

import axios from "axios";
import { useParams } from "react-router-dom";
import { BackToJobPostingsLink } from "../components/BackToJobPostingsLink";
import { JobPostingDetail } from "../components/JobPostingDetail";
import { useJobPosting } from "../hooks/useJobPosting";

const pageTitle = "Job Posting Detail";

const mainClassName = "mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8";
const h1ClassName = "text-2xl font-semibold text-gray-900";
const pClassName = "mt-3 text-sm";

export function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const jobPostingId = id?.trim() ?? undefined;

  const jobPostingQuery = useJobPosting(jobPostingId);

  if (jobPostingQuery.isLoading) {
    return (
      <main className={mainClassName}>
        <h1 className={h1ClassName}>{pageTitle}</h1>
        <p className={`${pClassName} text-gray-600`}>Loading job posting...</p>
      </main>
    );
  }

  if (jobPostingQuery.isError) {
    const isNotFound =
      axios.isAxiosError(jobPostingQuery.error) &&
      jobPostingQuery.error.response?.status === 404;

    return (
      <main className={mainClassName}>
        <div
          className={
            isNotFound
              ? "rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              : "rounded-lg border border-red-200 bg-red-50 p-6"
          }
        >
          <h1 className={h1ClassName}>{pageTitle}</h1>

          <p
            className={
              isNotFound
                ? `${pClassName} text-gray-600`
                : `${pClassName} text-red-700`
            }
          >
            {isNotFound
              ? "Job posting not found."
              : "Could not load job posting."}
          </p>

          <BackToJobPostingsLink className="mt-6 inline-flex" />
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

          <BackToJobPostingsLink className="mt-6 inline-flex" />
        </div>
      </main>
    );
  }

  return (
    <main className={mainClassName}>
      <div className="mb-6">
        <BackToJobPostingsLink />

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          {pageTitle}
        </h1>
      </div>

      <JobPostingDetail jobPosting={jobPostingQuery.data} />
    </main>
  );
}
