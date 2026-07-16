// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/EditJobPostingLink.tsx

import { Link } from "react-router-dom";

import { getJobPostingEditPath } from "../constants";

const baseLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-yellow-300 px-4 py-2 text-sm font-semibold
  text-gray-600 shadow-sm transition hover:bg-yellow-400 focus:outline-none focus:ring-2
  focus:ring-yellow-200 focus:ring-offset-2
`.trim();

interface EditJobPostingLinkProps {
  jobPostingId: string;
  className?: string;
}

export function EditJobPostingLink({
  jobPostingId,
  className,
}: EditJobPostingLinkProps) {
  return (
    <Link
      to={getJobPostingEditPath(jobPostingId)}
      className={`${baseLinkClassName} ${className ?? ""}`.trim()}
    >
      Edit job posting
    </Link>
  );
}
