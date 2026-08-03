// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/actions/CreateJobPostingLink.tsx

import { Link } from "react-router-dom";

import { JOB_POSTINGS_CREATE_PATH } from "../../constants";

const createJobPostingLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2
`.trim();

export function CreateJobPostingLink() {
  return (
    <Link
      to={JOB_POSTINGS_CREATE_PATH}
      className={createJobPostingLinkClassName}
    >
      Create job posting
    </Link>
  );
}
