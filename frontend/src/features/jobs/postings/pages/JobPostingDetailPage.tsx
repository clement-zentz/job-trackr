// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/JobPostingDetailPage.tsx

import axios from "axios";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";

import {
  CreateJobCandidacyLink,
  SeeJobCandidacyLink,
} from "@/features/jobs/candidacies/components/actions";

import {
  BackToJobPostingsLink,
  DeleteJobPostingButton,
  EditJobPostingLink,
} from "../components/actions";
import { JobPostingDetail } from "../components/JobPostingDetail";
import { useJobPosting } from "../hooks/useJobPosting";

const pageTitle = "Job Posting Detail";
const pageDescription = "Review and manage this job posting.";

const sectionClassName = "mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8";

interface PageHeaderProps {
  actions?: ReactNode;
}

function pageHeader({ actions }: PageHeaderProps = {}) {
  return (
    <div className="mb-4">
      <BackToJobPostingsLink />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {pageTitle}
          </h1>

          <p className="text-sm text-gray-600">{pageDescription}</p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function JobPostingDetailPage() {
  const { id: jobPostingIdParam } = useParams<{ id: string }>();

  const jobPostingId = jobPostingIdParam?.trim() ?? "";

  const jobPostingQuery = useJobPosting(jobPostingId);

  if (!jobPostingId) {
    return (
      <section className={sectionClassName}>
        {pageHeader()}

        <p role="alert" className="text-sm text-red-700">
          Invalid job posting identifier.
        </p>
      </section>
    );
  }

  if (jobPostingQuery.isLoading) {
    return (
      <section className={sectionClassName} aria-busy="true">
        {pageHeader()}

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
        {pageHeader()}

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

  return (
    <section className={sectionClassName}>
      {pageHeader({
        actions: (
          <>
            {jobPosting.candidacy_id ? (
              <SeeJobCandidacyLink candidacyId={jobPosting.candidacy_id} />
            ) : (
              <CreateJobCandidacyLink jobPostingId={jobPosting.id} />
            )}

            <EditJobPostingLink jobPostingId={jobPosting.id} />

            <DeleteJobPostingButton
              jobPostingId={jobPosting.id}
              jobPostingTitle={jobPosting.title}
            />
          </>
        ),
      })}

      <JobPostingDetail jobPosting={jobPosting} />
    </section>
  );
}
