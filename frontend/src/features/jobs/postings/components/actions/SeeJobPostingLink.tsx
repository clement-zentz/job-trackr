// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/actions/SeeJobPostingLink.tsx

import { Link } from "react-router-dom";

import { getJobPostingDetailPath } from "@/features/jobs/postings/constants";

const baseLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-cyan-700 focus:outline-none focus:ring-2
  focus:ring-cyan-500 focus:ring-offset-2
`.trim();

interface SeeJobPostingLinkProps {
  jobPostingId: string;
  className?: string;
}

export function SeeJobPostingLink({
  jobPostingId,
  className = "",
}: SeeJobPostingLinkProps) {
  return (
    <Link
      to={getJobPostingDetailPath(jobPostingId)}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      See job posting
    </Link>
  );
}
