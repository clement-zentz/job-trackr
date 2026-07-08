// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingCreatePage.tsx

import { useNavigate } from "react-router-dom";
import { BackToJobPostingsLink } from "../components/BackToJobPostingsLink";
import { JobPostingForm } from "../components/form/JobPostingForm";
import {
  emptyJobPostingFormValues,
  formValuesToCreatePayload,
} from "../components/form/jobPostingFormMappers";
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

      <JobPostingForm
        initialValues={emptyJobPostingFormValues}
        isSubmitting={createJobPosting.isPending}
        error={
          createJobPosting.error ? "Could not create job posting." : undefined
        }
        submitLabel="Create job posting"
        submittingLabel="Creating..."
        onSubmit={(values) => {
          createJobPosting.mutate(formValuesToCreatePayload(values), {
            onSuccess: () => {
              navigate("..");
            },
          });
        }}
      />
    </main>
  );
}
