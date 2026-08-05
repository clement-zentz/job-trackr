// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/actions/CreateJobCandidacyLink.tsx

import { Link } from "react-router-dom";

import { getJobCandidacyCreatePath } from "@/features/jobs/candidacies/constants";

const baseLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2
`.trim();

interface CreateJobCandidacyLinkProps {
  jobPostingId: string;
}

export function CreateJobCandidacyLink({
  jobPostingId,
}: CreateJobCandidacyLinkProps) {
  return (
    <Link
      to={getJobCandidacyCreatePath(jobPostingId)}
      className={baseLinkClassName}
    >
      Create job candidacy
    </Link>
  );
}
