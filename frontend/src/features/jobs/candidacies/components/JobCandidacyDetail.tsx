// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/JobCandidacyDetail.tsx

import type { JobCandidacyDetailRead } from "../types";
import { formatDateOnly } from "./utils";

interface JobCandidacyDetailProps {
  candidacy: JobCandidacyDetailRead;
}

export function JobCandidacyDetail({ candidacy }: JobCandidacyDetailProps) {
  const jobPosting = candidacy.job_posting;
  const notes = candidacy.notes.trim();

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-gray-100 p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            {jobPosting.title}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-800">
              {jobPosting.company}
            </span>

            <span aria-hidden="true"> · </span>

            {jobPosting.location}
          </p>
        </div>

        <span className="w-fit shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
          {candidacy.status_label}
        </span>
      </header>

      <dl className="space-y-6 p-6">
        <div>
          <dt className="text-sm font-medium text-gray-700">Applied on</dt>

          <dd className="mt-1 text-sm text-gray-600">
            {formatDateOnly(candidacy.applied_on)}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-700">Notes</dt>

          <dd
            className={`mt-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
              notes ? "text-gray-700" : "italic text-gray-500"
            }`}
          >
            {notes || "No notes have been added."}
          </dd>
        </div>
      </dl>
    </article>
  );
}
