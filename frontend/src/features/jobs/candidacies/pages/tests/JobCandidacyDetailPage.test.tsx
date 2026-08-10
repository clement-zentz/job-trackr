// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/tests/JobCandidacyDetailPage.test.tsx

import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getJobPostingDetailPath } from "@/features/jobs/postings/constants";
import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";
import { renderWithQueryClient } from "@/tests/utils";

import { JobCandidacyDetail } from "../../components/JobCandidacyDetail";
import {
  getJobCandidacyEditPath,
  JOB_CANDIDACIES_LIST_PATH,
} from "../../constants";
import { useJobCandidacy } from "../../hooks/useJobCandidacy";
import { JobCandidacyDetailPage } from "../JobCandidacyDetailPage";

vi.mock("../../hooks/useJobCandidacy");

vi.mock("../../components/JobCandidacyDetail", () => ({
  JobCandidacyDetail: vi.fn(() => (
    <div data-testid="job-candidacy-detail">Job candidacy content</div>
  )),
}));

const routePath = "/jobs/candidacies/:candidacyId";

function renderPage(initialEntry = "/jobs/candidacies/candidacy-1") {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={routePath} element={<JobCandidacyDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockQueryResult(
  overrides: Partial<ReturnType<typeof useJobCandidacy>> = {},
) {
  vi.mocked(useJobCandidacy).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof useJobCandidacy>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("JobCandidacyDetailPage", () => {
  it("normalizes the route parameter before fetching the candidacy", () => {
    mockQueryResult();

    renderPage("/jobs/candidacies/%20candidacy-1%20");

    expect(useJobCandidacy).toHaveBeenCalledWith("candidacy-1");
  });

  it("shows an error when the candidacy identifier is empty", () => {
    mockQueryResult();

    renderPage("/jobs/candidacies/%20%20%20");

    expect(
      screen.getByRole("heading", {
        name: "Job Candidacy Detail",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid candidacy identifier.",
    );

    expect(useJobCandidacy).toHaveBeenCalledWith("");
    expect(
      screen.queryByTestId("job-candidacy-detail"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Back to candidacies" }),
    ).toHaveAttribute("href", JOB_CANDIDACIES_LIST_PATH);
  });

  it("shows the loading state", () => {
    mockQueryResult({
      isLoading: true,
    });

    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Job Candidacy Detail",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Loading candidacy...")).toBeInTheDocument();

    expect(
      screen.getByText("Loading candidacy...").closest("section"),
    ).toHaveAttribute("aria-busy", "true");

    expect(
      screen.queryByRole("link", { name: "See job posting" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("job-candidacy-detail"),
    ).not.toBeInTheDocument();
  });

  it("shows an error when loading the candidacy fails", () => {
    mockQueryResult({
      isError: true,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load this job candidacy.",
    );
    expect(
      screen.queryByRole("link", { name: "See job posting" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("job-candidacy-detail"),
    ).not.toBeInTheDocument();
  });

  it("shows an error when the query succeeds without candidacy data", () => {
    mockQueryResult({
      data: undefined,
      isError: false,
      isLoading: false,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load this job candidacy.",
    );
  });

  it("renders the loaded candidacy and page actions", () => {
    const candidacy = createJobCandidacyDetailRead();

    mockQueryResult({
      data: candidacy,
    });

    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Job Candidacy Detail",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track and manage this job application."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to candidacies" }),
    ).toHaveAttribute("href", JOB_CANDIDACIES_LIST_PATH);

    expect(
      screen.getByRole("link", { name: "See job posting" }),
    ).toHaveAttribute(
      "href",
      getJobPostingDetailPath(candidacy.job_posting.id),
    );

    expect(
      screen.getByRole("link", { name: "Edit job candidacy" }),
    ).toHaveAttribute("href", getJobCandidacyEditPath(candidacy.id));

    expect(
      screen.getByRole("button", { name: "Delete job candidacy" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("job-candidacy-detail")).toBeInTheDocument();
    expect(JobCandidacyDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        candidacy,
      }),
      undefined,
    );
  });
});
