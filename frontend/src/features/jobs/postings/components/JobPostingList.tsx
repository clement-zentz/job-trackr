// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.tsx

import { useJobPostings } from "../hooks/useJobPostings";
import { JobPostingCard } from "./JobPostingCard";

export function JobPostingList() {
  const { data, isLoading, isError } = useJobPostings();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading jobs</div>;

  return (
    <div className="space-y-4">
      {data?.map((job) => (
        <JobPostingCard key={job.id} job={job} />
      ))}
    </div>
  );
}
