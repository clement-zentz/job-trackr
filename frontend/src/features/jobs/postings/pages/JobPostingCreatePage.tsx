// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingCreatePage.tsx

import { useNavigate } from "react-router-dom";
import { BackToJobPostingsLink } from "../components/BackToJobPostingsLink";
import { JobPostingCreateForm } from "../components/JobPostingCreateForm";
import { useCreateJobPosting } from "../hooks/useCreateJobPosting";

export function JobPostingCreatePage() {
  const navigate = useNavigate();
  const createJobPosting = useCreateJobPosting();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <BackToJobPostingsLink />

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Create Job Posting
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add the main information about the job posting.
        </p>
      </div>

      <JobPostingCreateForm
        isSubmitting={createJobPosting.isPending}
        error={
          createJobPosting.error ? "Could not create job posting." : undefined
        }
        onSubmit={(payload) => {
          createJobPosting.mutate(payload, {
            onSuccess: () => {
              navigate("..");
            },
          });
        }}
      />
    </main>
  );
}
