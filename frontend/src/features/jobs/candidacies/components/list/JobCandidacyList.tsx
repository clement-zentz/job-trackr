// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/JobCandidacyList.tsx

import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import {
  BackToJobPostingsLink,
  CreateJobPostingLink,
} from "@/features/jobs/postings/components/actions";

import { normalizeJobCandidacyParams } from "../../api/normalizeJobCandidacyParams";
import {
  DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
  getJobCandidacyDetailPath,
} from "../../constants";
import { useJobCandidacies } from "../../hooks/useJobCandidacies";
import type { JobCandidacyListParams } from "../../types";
import { JobCandidacyCard } from "./JobCandidacyCard";
import { JobCandidacyPagination } from "./JobCandidacyPagination";

interface JobCandidacyListProps {
  params: JobCandidacyListParams;
  onPageChange: (page: number) => void;
}

export function JobCandidacyList({
  params,
  onPageChange,
}: JobCandidacyListProps) {
  const normalizedParams = normalizeJobCandidacyParams(params);
  const currentPage = params.page ?? 1;

  const { data, error, isLoading, isError, isFetching, isPlaceholderData } =
    useJobCandidacies(params);

  const jobCandidacies = data?.results ?? [];
  const hasJobCandidacies = jobCandidacies.length > 0;

  const hasActiveFilters = Object.keys(normalizedParams).some(
    (key) => key !== "page" && key !== "page_size" && key !== "ordering",
  );

  const showEmptyState =
    data !== undefined && !isPlaceholderData && !hasJobCandidacies;

  const showOnboarding = showEmptyState && !isError && !hasActiveFilters;

  type DrfErrorResponse = {
    detail?: string;
  };

  // DRF PageNumberPagination returns HTTP 404 for invalid pages.
  const isInvalidPage =
    currentPage > 1 &&
    isError &&
    isAxiosError<DrfErrorResponse>(error) &&
    error.response?.status === 404 &&
    error.response.data?.detail === "Invalid page.";

  if (isInvalidPage) {
    return (
      <section className="space-y-2">
        <p role="alert">This page is no longer available.</p>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          className="rounded border px-4 py-2"
        >
          Go to first page
        </button>
      </section>
    );
  }

  if (isError && !data) {
    return <p role="alert">Error loading candidacies.</p>;
  }

  if (isLoading && !data) {
    return <p>Loading candidacies...</p>;
  }

  const totalPages = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / DEFAULT_JOB_CANDIDACIES_PAGE_SIZE),
  );

  return (
    <section className="space-y-4">
      {isError && data && (
        <p role="alert">
          Failed to refresh candidacies. Showing previous data.
        </p>
      )}

      {isFetching && data && <p>Loading page...</p>}

      {/* Avoid showing empty-state guidance for placeholder data. */}
      {showEmptyState && (
        <div className="space-y-2">
          <p>
            {isError
              ? "No job candidacies in the last successfully loaded results."
              : hasActiveFilters
                ? "No job candidacies match your search or filters."
                : "No job candidacies found."}
          </p>

          {showOnboarding && (
            <>
              <p>
                Create a job posting or select an existing one to attach a
                candidacy.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <CreateJobPostingLink />
                <BackToJobPostingsLink text="See job postings" />
              </div>
            </>
          )}
        </div>
      )}

      {hasJobCandidacies && (
        <>
          <div className="grid gap-4">
            {jobCandidacies.map((jobCandidacy) => (
              <Link
                key={jobCandidacy.id}
                to={getJobCandidacyDetailPath(jobCandidacy.id)}
                aria-label={`View details for ${jobCandidacy.job_posting.title} at ${jobCandidacy.job_posting.company}`}
                className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <JobCandidacyCard candidacy={jobCandidacy} />
              </Link>
            ))}
          </div>

          <JobCandidacyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasPreviousPage={Boolean(data?.previous)}
            hasNextPage={Boolean(data?.next)}
            isFetching={isFetching}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  );
}
