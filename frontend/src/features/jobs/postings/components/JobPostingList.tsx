// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.tsx

import { useJobPostings } from "../hooks/useJobPostings";
import { JobPostingCard } from "./JobPostingCard";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";
import type { JobPostingListParams } from "../types";

interface JobPostingListProps {
  params: JobPostingListParams;
  onPageChange: (page: number) => void;
}

export function JobPostingList({ params, onPageChange }: JobPostingListProps) {
  const { data, isLoading, isError, isFetching } = useJobPostings(params);

  // Error state
  if (isError) return <div>Error loading jobs</div>;

  // Loading state
  if (isLoading || (!data && !isError)) return <div>Loading...</div>;

  // Empty state
  if (!data?.results.length) {
    return <div>No job postings found.</div>;
  }

  const currentPage = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_JOB_POSTINGS_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));

  return (
    <div className="space-y-4">
      {/* Background fetching indicator */}
      {isFetching && (
        <div className="text-sm text-muted-foreground">Loading page...</div>
      )}

      {/* Job list */}
      {data?.results.map((job) => (
        <JobPostingCard key={job.id} job={job} />
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <button
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!data?.next || isFetching}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
