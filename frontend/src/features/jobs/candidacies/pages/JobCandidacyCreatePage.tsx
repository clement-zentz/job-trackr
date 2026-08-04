// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/JobCandidacyCreatePage.tsx

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BackToJobPostingLink } from "@/features/jobs/postings/components/actions";
import { useJobPosting } from "@/features/jobs/postings/hooks/useJobPosting";

import {
  BackToCandidaciesLink,
  SeeJobCandidacyLink,
} from "../components/actions";
import { JobCandidacyForm } from "../components/form/JobCandidacyForm";
import {
  createEmptyJobCandidacyFormValues,
  formValuesToCreatePayload,
} from "../components/form/jobCandidacyFormMappers";
import { getJobCandidacyDetailPath } from "../constants";
import { useCreateJobCandidacy } from "../hooks/useCreateJobCandidacy";

const sectionClassName = "mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8";

interface PageHeaderProps {
  jobPostingId?: string;
}

function PageHeader({ jobPostingId }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {jobPostingId ? (
        <BackToJobPostingLink jobPostingId={jobPostingId} />
      ) : (
        <BackToCandidaciesLink />
      )}

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Create Job Candidacy
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Add application details for this job posting.
        </p>
      </div>
    </header>
  );
}

export function JobCandidacyCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const jobPostingId = searchParams.get("jobPostingId")?.trim() ?? "";

  const jobPostingQuery = useJobPosting(jobPostingId);
  const createJobCandidacy = useCreateJobCandidacy();

  if (!jobPostingId) {
    return (
      <section className={sectionClassName}>
        <PageHeader />

        <p role="alert" className="text-sm text-red-700">
          Invalid job posting identifier.
        </p>
      </section>
    );
  }

  if (jobPostingQuery.isLoading) {
    return (
      <section className={sectionClassName} aria-busy="true">
        <PageHeader jobPostingId={jobPostingId} />

        <p aria-live="polite" className="text-sm text-gray-600">
          Loading job posting...
        </p>
      </section>
    );
  }

  if (jobPostingQuery.isError || !jobPostingQuery.data) {
    const isNotFound =
      !jobPostingQuery.isError ||
      (axios.isAxiosError(jobPostingQuery.error) &&
        jobPostingQuery.error.response?.status === 404);

    return (
      <section className={sectionClassName}>
        <PageHeader jobPostingId={jobPostingId} />

        <p
          role="alert"
          className={`text-sm ${isNotFound ? "text-gray-600" : "text-red-700"}`}
        >
          {isNotFound
            ? "Job posting not found."
            : "Could not load job posting."}
        </p>
      </section>
    );
  }

  const jobPosting = jobPostingQuery.data;

  if (jobPosting.candidacy_id) {
    return (
      <section className={sectionClassName}>
        <PageHeader jobPostingId={jobPosting.id} />

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p role="alert" className="text-sm text-gray-700">
            This job posting already has a candidacy.
          </p>

          <SeeJobCandidacyLink
            candidacyId={jobPosting.candidacy_id}
            className="mt-4 inline-block"
          />
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      <PageHeader jobPostingId={jobPosting.id} />

      <article className="mb-6 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Job posting
        </p>

        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          {jobPosting.title}
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium text-gray-800">
            {jobPosting.company}
          </span>

          <>
            <span aria-hidden="true"> · </span>
            {jobPosting.location}
          </>
        </p>
      </article>

      <JobCandidacyForm
        initialValues={createEmptyJobCandidacyFormValues()}
        isSubmitting={createJobCandidacy.isPending}
        error={
          createJobCandidacy.isError
            ? "Could not create job candidacy."
            : undefined
        }
        submitLabel="Create job candidacy"
        submittingLabel="Creating..."
        onSubmit={(values) => {
          const payload = formValuesToCreatePayload(jobPosting.id, values);

          createJobCandidacy.mutate(payload, {
            onSuccess: (createdCandidacy) => {
              navigate(getJobCandidacyDetailPath(createdCandidacy.id), {
                replace: true,
              });
            },
          });
        }}
      />
    </section>
  );
}
