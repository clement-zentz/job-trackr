// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.tsx

import { useJobPostings } from "../hooks/useJobPostings";
import { JobPostingCard } from "./JobPostingCard";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

interface JobPostingListProps {
  page: number;
  onPageChange: (page: number) => void;
}

export function JobPostingList({ page, onPageChange }: JobPostingListProps) {
  const { data, isLoading, isError, isFetching } = useJobPostings(page);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading jobs</div>;

  // Empty list
  if (!data?.results.length) {
    return <div>No job postings found.</div>;
  }

  const totalPages = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / DEFAULT_JOB_POSTINGS_PAGE_SIZE),
  );

  return (
    <div className="space-y-4">
      {isFetching && (
        <div className="text-sm text-muted-foreground">Loading page...</div>
      )}

      {data?.results.map((job) => (
        <JobPostingCard key={job.id} job={job} />
      ))}

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!data?.previous || isFetching}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!data?.next || isFetching}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
