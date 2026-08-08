// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/actions/EditJobCandidacyLink.tsx

import { Link } from "react-router-dom";

import { getJobCandidacyEditPath } from "../../constants";

const baseLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-yellow-300 px-4 py-2 text-sm font-semibold
  text-gray-700 shadow-sm transition hover:bg-yellow-400 focus:outline-none focus:ring-2
  focus:ring-yellow-300 focus:ring-offset-2
`.trim();

interface EditJobCandidacyLinkProps {
  candidacyId: string;
  className?: string;
}

export function EditJobCandidacyLink({
  candidacyId,
  className = "",
}: EditJobCandidacyLinkProps) {
  return (
    <Link
      to={getJobCandidacyEditPath(candidacyId)}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      Edit job candidacy
    </Link>
  );
}
