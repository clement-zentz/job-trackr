// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/JobCandidacyCard.tsx

import type { JobCandidacyListItemRead } from "../../types";
import { formatDateOnly } from "../utils";

interface JobCandidacyCardProps {
  candidacy: JobCandidacyListItemRead;
}

export function JobCandidacyCard({ candidacy }: JobCandidacyCardProps) {
  const jobPosting = candidacy.job_posting;
  const notesPreview = candidacy.notes_preview.trim();

  return (
    <article className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex flex-col items-start gap-4">
        <div>
          <h2 className="text-lg font-semibold">{jobPosting.title}</h2>

          <p className="text-sm text-gray-600">
            {jobPosting.company} · {jobPosting.location}
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
          {candidacy.status_label}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-700">Applied on</dt>
          <dd className="text-gray-600">
            {formatDateOnly(candidacy.applied_on)}
          </dd>
        </div>

        {notesPreview && (
          <div>
            <dt className="font-medium text-gray-700">Notes</dt>
            <dd className="text-gray-600">{notesPreview}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
