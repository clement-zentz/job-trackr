// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/BackToJobPostingsLink.tsx

import { Link } from "react-router-dom";

import { JOB_POSTINGS_LIST_PATH } from "../constants";

const baseLinkClassName = `
  text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline
`.trim();

type BackToJobPostingsLinkProps = {
  className?: string;
};

export function BackToJobPostingsLink({
  className = "",
}: BackToJobPostingsLinkProps) {
  return (
    <Link
      to={JOB_POSTINGS_LIST_PATH}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      Back to job postings
    </Link>
  );
}
