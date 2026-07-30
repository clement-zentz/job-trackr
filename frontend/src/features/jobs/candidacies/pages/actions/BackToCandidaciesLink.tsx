// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/actions/BackToCandidaciesLink.tsx

import { Link } from "react-router-dom";

import { JOB_CANDIDACIES_LIST_PATH } from "../../constants";

const baseLinkClassName = `
  text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline
`.trim();

type BackToCandidaciesLinkProps = {
  className?: string;
};

export function BackToCandidaciesLink({
  className = "",
}: BackToCandidaciesLinkProps) {
  return (
    <Link
      to={JOB_CANDIDACIES_LIST_PATH}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      Back to candidacies
    </Link>
  );
}
