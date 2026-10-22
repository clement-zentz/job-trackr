// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/list/JobPostingList.tsx

import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import { normalizeJobPostingParams } from "../../api/normalizeJobPostingParams";
import {
  DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  getJobPostingDetailPath,
} from "../../constants";
import { useJobPostings } from "../../hooks/useJobPostings";
import type { JobPostingListParams } from "../../types";
import { CreateJobPostingLink } from "../actions";
import { JobPostingCard } from "./JobPostingCard";

export interface JobPostingListProps {
  params: JobPostingListParams;
  onPageChange: (page: number) => void;
}

export function JobPostingList({ params, onPageChange }: JobPostingListProps) {
  const normalizedParams = normalizeJobPostingParams(params);
  const currentPage = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_JOB_POSTINGS_PAGE_SIZE;

  const { data, error, isLoading, isError, isFetching, isPlaceholderData } =
    useJobPostings(params);

  const jobPostings = data?.results ?? [];
  const hasJobPostings = jobPostings.length > 0;

  const hasActiveFilters = Object.keys(normalizedParams).some(
    (key) => key !== "page" && key !== "page_size" && key !== "ordering",
  );

  const showEmptyState =
    data !== undefined && !isPlaceholderData && !hasJobPostings;

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
      <div className="space-y-2">
        <p role="alert">This page is no longer available.</p>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          className="rounded border px-4 py-2"
        >
          Go to first page
        </button>
      </div>
    );
  }

  // Blocking error: no data available.
  if (isError && !data) {
    return <p role="alert">Error loading job postings.</p>;
  }

  // Initial loading.
  if (isLoading && !data) {
    return <p>Loading...</p>;
  }

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  return (
    <div className="space-y-4">
      {/* Non-blocking error: retain previously available data. */}
      {isError && data && (
        <p role="alert" className="text-sm text-red-500">
          Failed to refresh results. Showing previous data.
        </p>
      )}

      {/* Background fetching indicator. */}
      {isFetching && data && (
        <p className="text-sm text-muted-foreground">Loading page...</p>
      )}

      {/* Avoid showing empty-state guidance for placeholder data. */}
      {showEmptyState && (
        <div className="space-y-2">
          <p>
            {isError
              ? "No job postings in the last successfully loaded results."
              : hasActiveFilters
                ? "No job postings match your search or filters."
                : "No job postings found."}
          </p>

          {showOnboarding && (
            <div className="space-y-2">
              <p>
                Create your first job posting to start tracking your
                applications.
              </p>
              <CreateJobPostingLink />
            </div>
          )}
        </div>
      )}

      {hasJobPostings && (
        <>
          {/* Job posting list. */}
          {jobPostings.map((jobPosting) => (
            <Link
              key={jobPosting.id}
              to={getJobPostingDetailPath(jobPosting.id)}
              aria-label={`View details for ${jobPosting.title} at ${jobPosting.company}`}
              className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <JobPostingCard job={jobPosting} />
            </Link>
          ))}

          {/* Pagination. */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!data?.previous || isFetching}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!data?.next || isFetching}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
