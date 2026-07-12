// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingUpdatePage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { BackToJobPostingLink } from "../components/BackToJobPostingLink";
import { JobPostingForm } from "../components/form/JobPostingForm";
import {
  jobPostingToFormValues,
  formValuesToUpdatePayload,
} from "../components/form/jobPostingFormMappers";
import { useJobPosting } from "../hooks/useJobPosting";
import { useUpdateJobPosting } from "../hooks/useUpdateJobPosting";
import { getJobPostingDetailPath } from "../constants";

const h1Text = "Update Job Posting";

const mainClassName = "mx-auto max-w-3xl px-4 py-8";
const h1ClassName = "mt-4 text-2xl font-bold text-slate-900";

export function JobPostingUpdatePage() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const jobPostingId = id?.trim() ?? undefined;

  const jobPostingQuery = useJobPosting(jobPostingId);
  const updateJobPosting = useUpdateJobPosting();

  if (!jobPostingId) {
    return (
      <main className={mainClassName}>
        <h1 className={h1ClassName}>{h1Text}</h1>
        <p className="text-red-500">Job posting ID is missing.</p>
      </main>
    );
  }

  if (jobPostingQuery.isLoading) {
    return (
      <main className={mainClassName}>
        <h1 className={h1ClassName}>{h1Text}</h1>
        <p>Loading job posting...</p>
      </main>
    );
  }

  if (jobPostingQuery.isError || !jobPostingQuery.data) {
    return (
      <main className={mainClassName}>
        <h1 className={h1ClassName}>{h1Text}</h1>
        <p className="text-red-500">Could not load job posting.</p>
      </main>
    );
  }

  return (
    <main className={mainClassName}>
      <div className="mb-6">
        <BackToJobPostingLink jobPostingId={jobPostingId} />

        <h1 className={h1ClassName}>{h1Text}</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the main information about the job posting.
        </p>
      </div>

      <JobPostingForm
        key={jobPostingQuery.data.id}
        initialValues={jobPostingToFormValues(jobPostingQuery.data)}
        isSubmitting={updateJobPosting.isPending}
        error={
          updateJobPosting.error ? "Could not update job posting." : undefined
        }
        submitLabel="Save Job Posting"
        submittingLabel="Saving..."
        onSubmit={(values) => {
          updateJobPosting.mutate(
            {
              id: jobPostingId,
              payload: formValuesToUpdatePayload(values),
            },
            {
              onSuccess: () => {
                navigate(getJobPostingDetailPath(jobPostingId), {
                  replace: true,
                });
              },
            },
          );
        }}
      />
    </main>
  );
}
