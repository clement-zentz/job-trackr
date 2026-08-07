// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/JobCandidacyUpdatePage.tsx

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  BackToCandidaciesLink,
  BackToCandidacyLink,
} from "../components/actions";
import { JobCandidacyForm } from "../components/form/JobCandidacyForm";
import {
  formValuesToUpdatePayload,
  jobCandidacyToFormValues,
} from "../components/form/jobCandidacyFormMappers";
import { getJobCandidacyDetailPath } from "../constants";
import { useJobCandidacy } from "../hooks/useJobCandidacy";
import { useUpdateJobCandidacy } from "../hooks/useUpdateJobCandidacy";

const sectionClassName = "mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8";

interface PageHeaderProps {
  candidacyId?: string;
}

function PageHeader({ candidacyId }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {candidacyId ? (
        <BackToCandidacyLink candidacyId={candidacyId} />
      ) : (
        <BackToCandidaciesLink />
      )}

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Update Job Candidacy
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Update application details for this job posting.
        </p>
      </div>
    </header>
  );
}

export function JobCandidacyUpdatePage() {
  const navigate = useNavigate();

  const { candidacyId: candidacyIdParam } = useParams<{
    candidacyId: string;
  }>();

  const candidacyId = candidacyIdParam?.trim() ?? "";

  const candidacyQuery = useJobCandidacy(candidacyId);
  const updateJobCandidacy = useUpdateJobCandidacy();

  if (!candidacyId) {
    return (
      <section className={sectionClassName}>
        <PageHeader />

        <p role="alert" className="text-sm text-red-700">
          Invalid candidacy identifier.
        </p>
      </section>
    );
  }

  if (candidacyQuery.isLoading) {
    return (
      <section className={sectionClassName} aria-busy="true">
        <PageHeader candidacyId={candidacyId} />

        <p aria-live="polite" className="text-sm text-gray-600">
          Loading candidacy...
        </p>
      </section>
    );
  }

  if (candidacyQuery.isError || !candidacyQuery.data) {
    const isNotFound =
      !candidacyQuery.isError ||
      (axios.isAxiosError(candidacyQuery.error) &&
        candidacyQuery.error.response?.status === 404);

    return (
      <section className={sectionClassName}>
        <PageHeader candidacyId={candidacyId} />

        <p
          role="alert"
          className={`text-sm ${isNotFound ? "text-gray-600" : "text-red-700"}`}
        >
          {isNotFound
            ? "Job candidacy not found."
            : "Could not load job candidacy."}
        </p>
      </section>
    );
  }

  const candidacy = candidacyQuery.data;

  return (
    <section className={sectionClassName}>
      <PageHeader candidacyId={candidacy.id} />

      <article className="mb-6 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Job posting
        </p>

        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          {candidacy.job_posting.title}
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium text-gray-800">
            {candidacy.job_posting.company}
          </span>

          <span aria-hidden="true"> · </span>

          {candidacy.job_posting.location}
        </p>
      </article>

      <JobCandidacyForm
        key={candidacy.id}
        initialValues={jobCandidacyToFormValues(candidacy)}
        isSubmitting={updateJobCandidacy.isPending}
        error={
          updateJobCandidacy.isError
            ? "Could not update job candidacy."
            : undefined
        }
        submitLabel="Update job candidacy"
        submittingLabel="Updating..."
        onSubmit={(values) => {
          updateJobCandidacy.mutate(
            {
              candidacyId: candidacy.id,
              payload: formValuesToUpdatePayload(values),
            },
            {
              onSuccess: (updatedCandidacy) => {
                navigate(getJobCandidacyDetailPath(updatedCandidacy.id), {
                  replace: true,
                });
              },
            },
          );
        }}
      />
    </section>
  );
}
