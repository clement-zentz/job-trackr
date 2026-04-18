// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { JobPostingList } from "./JobPostingList";
import * as hook from "../hooks/useJobPostings";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createJobPosting } from "@/tests/factories/jobPosting";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPosting, JobPostingListParams } from "../types";

const defaultParams: JobPostingListParams = {
  page: 1,
  pageSize: 10,
  ordering: "-posted_at",
};

describe("JobPostingList", () => {
  const defaultProps = {
    params: defaultParams,
    onPageChange: vi.fn(),
  };

  it("renders loading state", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
      error: null,
      status: "pending",
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList {...defaultProps} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      error: new Error("Test error"),
      status: "error",
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList {...defaultProps} />);

    expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
  });

  it("renders job list", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: createPaginatedResponse([createJobPosting()]),
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
      status: "success",
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList {...defaultProps} />);

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});

describe("JobPostingList pagination", () => {
  let onPageChange: (page: number) => void;

  beforeEach(() => {
    onPageChange = vi.fn();
    vi.clearAllMocks();
  });

  function renderWithParams(overrides: Partial<JobPostingListParams> = {}) {
    const params: JobPostingListParams = {
      ...defaultParams,
      ...overrides,
    };

    return render(
      <JobPostingList params={params} onPageChange={onPageChange} />,
    );
  }

  function mockSuccessPagination(
    overrides: Partial<PaginatedResponse<JobPosting>> = {},
    options?: { isFetching?: boolean },
  ) {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: createPaginatedResponse([createJobPosting()], overrides),
      isLoading: false,
      isError: false,
      isFetching: options?.isFetching ?? false,
      error: null,
      status: "success",
    } as ReturnType<typeof hook.useJobPostings>);
  }

  it("disables previous button when there is no previous page", () => {
    mockSuccessPagination({
      previous: null,
    });

    renderWithParams({ page: 1 });

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("disables next button when there is no next page", () => {
    mockSuccessPagination({
      next: null,
    });

    renderWithParams({ page: 2 });

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onPageChange with next page when next is clicked", () => {
    mockSuccessPagination({
      next: "http://api.test?page=2",
    });

    renderWithParams({ page: 1 });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with previous page when previous is clicked", () => {
    mockSuccessPagination({
      previous: "http://api.test?page=1",
    });

    renderWithParams({ page: 2 });

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("renders current page indicator", () => {
    mockSuccessPagination({
      count: 45,
    });

    renderWithParams({ page: 2, pageSize: 20 });

    expect(screen.getByText("Page 2 / 3")).toBeInTheDocument();
  });

  it("hides pagination and shows empty state when the list is empty", () => {
    mockSuccessPagination({
      count: 0,
      results: [],
    });

    renderWithParams({ page: 1 });

    expect(screen.getByText("No job postings found.")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /previous/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  it("shows loading indicator while fetching a new page", () => {
    mockSuccessPagination({}, { isFetching: true });

    renderWithParams({ page: 2 });

    expect(screen.getByText(/loading page/i)).toBeInTheDocument();
  });

  it("disables pagination buttons while fetching a new page", () => {
    mockSuccessPagination(
      {
        previous: "http://api.test?page=1",
        next: "http://api.test?page=3",
      },
      { isFetching: true },
    );

    renderWithParams({ page: 2 });

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
