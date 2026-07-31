// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/actions/SeeJobCandidacyLink.tsx

import { Link } from "react-router-dom";

import { getJobCandidacyDetailPath } from "@/features/jobs/candidacies/constants";

const baseLinkClassName = `
  inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-cyan-700 focus:outline-none focus:ring-2
  focus:ring-cyan-500 focus:ring-offset-2
`.trim();

interface SeeJobCandidacyLinkProps {
  candidacyId: string;
  className?: string;
}

export function SeeJobCandidacyLink({
  candidacyId,
  className = "",
}: SeeJobCandidacyLinkProps) {
  return (
    <Link
      to={getJobCandidacyDetailPath(candidacyId)}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      See job candidacy
    </Link>
  );
}
