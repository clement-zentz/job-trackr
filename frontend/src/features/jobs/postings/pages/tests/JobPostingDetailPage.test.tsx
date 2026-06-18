// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/tests/JobPostingDetailPage.test.tsx

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useJobPosting } from "../../hooks/useJobPosting";
import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";
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
        id: "1",
        title: "Backend Developer",
      }),
    });

    renderJobPostingsRoute("/jobs/postings/1");

    expect(
      screen.getByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job postings" }),
    ).toHaveAttribute("href", "/jobs/postings");

    expect(
      screen.getByRole("heading", { name: "Backend Developer" }),
    ).toBeInTheDocument();
  });
});
