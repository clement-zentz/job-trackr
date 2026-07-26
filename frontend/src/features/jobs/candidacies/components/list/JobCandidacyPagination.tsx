// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/JobCandidacyPagination.tsx

interface JobCandidacyPaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function JobCandidacyPagination({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  isFetching,
  onPageChange,
}: JobCandidacyPaginationProps) {
  return (
    <nav
      aria-label="Candidacy pagination"
      className="flex items-center justify-between"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage || isFetching}
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
        disabled={!hasNextPage || isFetching}
        className="rounded border px-4 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
