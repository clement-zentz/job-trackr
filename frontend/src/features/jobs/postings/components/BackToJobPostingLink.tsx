// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/BackToJobPostingLink.tsx

import { Link } from "react-router-dom";
import { getJobPostingDetailPath } from "../constants";

const baseLinkClassName = `
  text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline
`.trim();

interface BackToJobPostingLinkProps {
  jobPostingId: string;
  className?: string;
  children?: React.ReactNode;
}

export function BackToJobPostingLink({
  jobPostingId,
  className,
  children = "Back to job posting",
}: BackToJobPostingLinkProps) {
  return (
    <Link
      to={getJobPostingDetailPath(jobPostingId)}
      replace
      className={`${baseLinkClassName} ${className ?? ""}`.trim()}
    >
      {children}
    </Link>
  );
}
