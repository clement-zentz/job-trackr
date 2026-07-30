// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/JobCandidacyDetailPage.tsx

import type { ReactNode } from "react";
import { useParams } from "react-router-dom";

import { JobCandidacyDetail } from "../components/JobCandidacyDetail";
import { useJobCandidacy } from "../hooks/useJobCandidacy";
import { BackToCandidaciesLink } from "./actions/BackToCandidaciesLink";
import { SeeJobPostingLink } from "./actions/SeeJobPostingLink";

const sectionClassName = "mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8";
const h1ClassName =
  "text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl";

interface PageHeaderProps {
  actions?: ReactNode;
}

function PageHeader({ actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <BackToCandidaciesLink />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={h1ClassName}>Job Candidacy Detail</h1>

          <p className="mt-1 text-sm text-gray-600">
            Track and manage this job application.
          </p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}

export function JobCandidacyDetailPage() {
  const { candidacyId: rawCandidacyIdParam } = useParams<{
    candidacyId: string;
  }>();

  const normalizedCandidacyId = rawCandidacyIdParam?.trim() ?? "";

  const {
    data: candidacy,
    isLoading,
    isError,
  } = useJobCandidacy(normalizedCandidacyId);

  if (!normalizedCandidacyId) {
    return (
      <section className={sectionClassName}>
        <PageHeader />

        <p role="alert">Invalid candidacy identifier.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={sectionClassName} aria-busy="true">
        <PageHeader />

        <p aria-live="polite">Loading candidacy...</p>
      </section>
    );
  }

  if (isError || !candidacy) {
    return (
      <section className={sectionClassName}>
        <PageHeader />

        <p role="alert">Unable to load this job candidacy.</p>
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      <PageHeader
        actions={<SeeJobPostingLink jobPostingId={candidacy.job_posting.id} />}
      />

      <JobCandidacyDetail candidacy={candidacy} />
    </section>
  );
}
