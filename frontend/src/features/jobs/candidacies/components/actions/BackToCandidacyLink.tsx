// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/actions/BackToCandidacyLink.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { getJobCandidacyDetailPath } from "../../constants";

const baseLinkClassName = `
  text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline
`.trim();

interface BackToCandidacyLinkProps {
  candidacyId: string;
  className?: string;
  children?: ReactNode;
}

export function BackToCandidacyLink({
  candidacyId,
  className = "",
  children = "Back to job candidacy",
}: BackToCandidacyLinkProps) {
  return (
    <Link
      to={getJobCandidacyDetailPath(candidacyId)}
      className={`${baseLinkClassName} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
