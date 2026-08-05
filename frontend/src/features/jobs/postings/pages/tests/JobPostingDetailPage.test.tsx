// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/tests/JobPostingDetailPage.test.tsx

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";

import { useJobPosting } from "../../hooks/useJobPosting";
import { renderJobPostingsRoute } from "../../tests/utils";

vi.mock("../../hooks/useJobPosting", () => ({
  useJobPosting: vi.fn(),
}));

const useJobPostingMock = vi.mocked(useJobPosting);

function mockUseJobPosting(
  queryState: Partial<ReturnType<typeof useJobPosting>>,
) {
  useJobPostingMock.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
    ...queryState,
  } as ReturnType<typeof useJobPosting>);
}

function createAxiosError(status: number) {
  return {
    isAxiosError: true,
    response: {
      status,
    },
    name: "AxiosError",
    message: "Request failed",
  } as Error;
}

describe("JobPostingDetailPage", () => {
  beforeEach(() => {
    useJobPostingMock.mockReset();
  });

  it("loads the job posting for the route id", () => {
    mockUseJobPosting({
      data: createJobPostingDetailRead({
        id: "123",
        title: "Frontend Developer",
      }),
    });

    renderJobPostingsRoute("/jobs/postings/123");

    expect(useJobPostingMock).toHaveBeenCalledWith("123");
  });

  it("renders the loading state", () => {
    mockUseJobPosting({
      isLoading: true,
    });

    renderJobPostingsRoute("/jobs/postings/1");

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Loading job posting...")).toBeInTheDocument();
  });

  it("renders the not-found state for a 404 error", () => {
    mockUseJobPosting({
      isError: true,
      error: createAxiosError(404),
    });

    renderJobPostingsRoute("/jobs/postings/1");

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Job posting not found.")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job postings" }),
    ).toHaveAttribute("href", "/jobs/postings");
  });

  it("renders the generic error state for a non-404 error", () => {
    mockUseJobPosting({
      isError: true,
      error: createAxiosError(500),
    });

    renderJobPostingsRoute("/jobs/postings/1");

    expect(screen.getByText("Could not load job posting.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job postings" }),
    ).toHaveAttribute("href", "/jobs/postings");
  });

  it("renders the empty-data fallback as not found", () => {
    mockUseJobPosting({
      data: undefined,
    });

    renderJobPostingsRoute("/jobs/postings/1");

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Job posting not found.")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job postings" }),
    ).toHaveAttribute("href", "/jobs/postings");
  });

  it("renders the job posting detail when the query succeeds", () => {
    mockUseJobPosting({
      data: createJobPostingDetailRead({
        id: "job-123",
        title: "Backend Developer",
      }),
    });

    renderJobPostingsRoute("/jobs/postings/job-123");

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job postings" }),
    ).toHaveAttribute("href", "/jobs/postings");

    expect(
      screen.getByRole("link", { name: "Edit job posting" }),
    ).toHaveAttribute("href", "/jobs/postings/job-123/edit");

    expect(
      screen.getByRole("heading", { name: "Backend Developer" }),
    ).toBeInTheDocument();
  });

  it("shows the create candidacy link when the posting has no candidacy", async () => {
    mockUseJobPosting({
      data: createJobPostingDetailRead({
        id: "job-posting-1",
        candidacy_id: null,
      }),
    });
    renderJobPostingsRoute("/jobs/postings/job-posting-1");

    const createLink = await screen.findByRole("link", {
      name: "Create job candidacy",
    });

    expect(createLink).toHaveAttribute(
      "href",
      "/jobs/candidacies/new?jobPostingId=job-posting-1",
    );

    expect(
      screen.queryByRole("link", {
        name: "See job candidacy",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows the candidacy detail link when the posting has a candidacy", async () => {
    mockUseJobPosting({
      data: createJobPostingDetailRead({
        id: "job-posting-1",
        candidacy_id: "candidacy-1",
      }),
    });
    renderJobPostingsRoute("/jobs/postings/job-posting-1");

    const candidacyLink = await screen.findByRole("link", {
      name: "See job candidacy",
    });

    expect(candidacyLink).toHaveAttribute(
      "href",
      "/jobs/candidacies/candidacy-1",
    );

    expect(
      screen.queryByRole("link", {
        name: "Create job candidacy",
      }),
    ).not.toBeInTheDocument();
  });
});
