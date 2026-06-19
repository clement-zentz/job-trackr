// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingList.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { JobPostingList, type JobPostingListProps } from "../JobPostingList";
import { useJobPostings } from "../../hooks/useJobPostings";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createJobPostingListItemRead } from "@/tests/factories/jobPosting";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import type { PaginatedResponse } from "@/types/pagination";
import type { JobPostingListItemRead, JobPostingListParams } from "../../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../../constants";

vi.mock("../../hooks/useJobPostings", () => ({
  useJobPostings: vi.fn(),
}));

const useJobPostingsMock = vi.mocked(useJobPostings);

type MockUseJobPostingsState = {
  data?: PaginatedResponse<JobPostingListItemRead>;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  error?: Error | null;
  status?: ReturnType<typeof useJobPostings>["status"];
};

function mockUseJobPostings(queryState: MockUseJobPostingsState) {
  useJobPostingsMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    error: null,
    status: "success",
    ...queryState,
  } as ReturnType<typeof useJobPostings>);
}

type MockJobPostingsDataOptions = {
  results?: JobPostingListItemRead[];
  paginationOverrides?: Partial<PaginatedResponse<JobPostingListItemRead>>;
  queryOverrides?: Omit<MockUseJobPostingsState, "data">;
};

function mockJobPostingsData({
  results = [createJobPostingListItemRead()],
  paginationOverrides = {},
  queryOverrides = {},
}: MockJobPostingsDataOptions = {}) {
  mockUseJobPostings({
    data: createPaginatedResponse(results, paginationOverrides),
    ...queryOverrides,
  });
}

describe("JobPostingList", () => {
  let onPageChange: (page: number) => void;

  beforeEach(() => {
    onPageChange = vi.fn();
    useJobPostingsMock.mockReset();
  });

  const defaultParams: JobPostingListParams = {
    page: 1,
    pageSize: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    ordering: "-posted_at",
  };

  function renderJobPostingList(props: Partial<JobPostingListProps> = {}) {
    const mergedProps: JobPostingListProps = {
      params: defaultParams,
      onPageChange,
      ...props,
    };

    return render(
      <MemoryRouter initialEntries={["/jobs/postings"]}>
        <Routes>
          <Route
            path="/jobs/postings"
            element={<JobPostingList {...mergedProps} />}
          />
        </Routes>
      </MemoryRouter>,
    );
  }

  function renderWithParams(overrides: Partial<JobPostingListParams> = {}) {
    renderJobPostingList({
      params: {
        ...defaultParams,
        ...overrides,
      },
    });
  }

  it("renders loading state", () => {
    mockUseJobPostings({
      isLoading: true,
      status: "pending",
    });

    renderJobPostingList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseJobPostings({
      isError: true,
      error: new Error("Test error"),
      status: "error",
    });

    renderJobPostingList();

    expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
  });

  it("renders job list", () => {
    const jobPosting = createJobPostingListItemRead({
      title: "Backend Engineer",
      company: "Acme",
    });

    mockJobPostingsData({ results: [jobPosting] });

    renderJobPostingList();

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("shows non-blocking error banner while keeping previous results", () => {
    const jobPosting = createJobPostingListItemRead({
      title: "Backend Engineer",
    });

    mockJobPostingsData({
      results: [jobPosting],
      queryOverrides: {
        isError: true,
        error: new Error("Refetch failed"),
        status: "error",
      },
    });

    renderJobPostingList();

    expect(screen.getByText(/failed to refresh results/i)).toBeInTheDocument();

    // Still shows data
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  it("shows non-blocking error banner with empty state", () => {
    mockJobPostingsData({
      results: [],
      paginationOverrides: { count: 0 },
      queryOverrides: {
        isError: true,
        error: new Error("Refetch failed"),
        status: "error",
      },
    });

    renderJobPostingList();

    expect(screen.getByText(/failed to refresh results/i)).toBeInTheDocument();

    expect(screen.getByText(/no job postings found/i)).toBeInTheDocument();
  });

  it("wraps each job posting card with a detail link", () => {
    const job = createJobPostingListItemRead({
      id: "job-123",
      title: "Backend Engineer",
      company: "Acme",
    });

    mockJobPostingsData({ results: [job] });

    renderJobPostingList();

    const detailLink = screen.getByRole("link", {
      name: /view details for backend engineer at acme/i,
    });

    expect(detailLink).toHaveAttribute("href", "/jobs/postings/job-123");
    expect(detailLink).toContainElement(
      screen.getByRole("heading", { name: /backend engineer/i }),
    );
  });

  describe("pagination", () => {
    it("disables previous button when there is no previous page", () => {
      mockJobPostingsData({
        paginationOverrides: {
          previous: null,
        },
      });

      renderWithParams({ page: 1 });

      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    });

    it("disables next button when there is no next page", () => {
      mockJobPostingsData({
        paginationOverrides: {
          next: null,
        },
      });

      renderWithParams({ page: 2 });

      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });

    it("calls onPageChange with next page when next is clicked", () => {
      mockJobPostingsData({
        paginationOverrides: {
          next: "http://api.test?page=2",
        },
      });

      renderWithParams({ page: 1 });

      fireEvent.click(screen.getByRole("button", { name: /next/i }));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange with previous page when previous is clicked", () => {
      mockJobPostingsData({
        paginationOverrides: {
          previous: "http://api.test?page=1",
        },
      });

      renderWithParams({ page: 2 });

      fireEvent.click(screen.getByRole("button", { name: /previous/i }));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("renders current page indicator", () => {
      mockJobPostingsData({
        paginationOverrides: {
          count: 45,
        },
      });

      renderWithParams({ page: 2, pageSize: 20 });

      expect(screen.getByText("Page 2 / 3")).toBeInTheDocument();
    });

    it("hides pagination and shows empty state when the list is empty", () => {
      mockJobPostingsData({
        paginationOverrides: {
          count: 0,
        },
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
      mockJobPostingsData({
        queryOverrides: { isFetching: true },
      });

      renderWithParams({ page: 2 });

      expect(screen.getByText(/loading page/i)).toBeInTheDocument();
    });

    it("disables pagination buttons while fetching a new page", () => {
      mockJobPostingsData({
        paginationOverrides: {
          previous: "http://api.test?page=1",
          next: "http://api.test?page=3",
        },
        queryOverrides: { isFetching: true },
      });

      renderWithParams({ page: 2 });

      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();

      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });
  });
});
