// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/JobCandidacyList.tsx

import { Link } from "react-router-dom";

import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../../constants";
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
  const { data, isLoading, isError, isFetching } = useJobCandidacies(params);

  if (isError && !data) {
    return <p role="alert">Error loading candidacies.</p>;
  }

  if (isLoading && !data) {
    return <p>Loading candidacies...</p>;
  }

  const currentPage = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_JOB_CANDIDACIES_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  return (
    <section className="space-y-4">
      {isError && data && (
        <p role="alert">
          Failed to refresh candidacies. Showing previous data.
        </p>
      )}

      {isFetching && data && <p>Loading page...</p>}

      {!data?.results.length ? (
        <p>No job candidacies found.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {data.results.map((candidacy) => (
              <Link
                to={candidacy.id}
                key={candidacy.id}
                aria-label={`View details for ${candidacy.job_posting.title} at ${candidacy.job_posting.company}`}
                className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <JobCandidacyCard candidacy={candidacy} />
              </Link>
            ))}
          </div>

          <JobCandidacyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasPreviousPage={Boolean(data.previous)}
            hasNextPage={Boolean(data.next)}
            isFetching={isFetching}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  );
}
