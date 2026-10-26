// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/list/tests/JobPostingList.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobPostingListItemRead } from "@/tests/factories/jobPosting";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import type { PaginatedResponse } from "@/types/pagination";

import {
  DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  getJobPostingDetailPath,
  JOB_POSTINGS_CREATE_PATH,
  JOB_POSTINGS_LIST_PATH,
} from "../../../constants";
import { useJobPostings } from "../../../hooks/useJobPostings";
import type {
  JobPostingListItemRead,
  JobPostingListParams,
} from "../../../types";
import {
  JobPostingList,
  type JobPostingListProps,
} from "../../list/JobPostingList";

vi.mock("../../../hooks/useJobPostings", () => ({
  useJobPostings: vi.fn(),
}));

const useJobPostingsMock = vi.mocked(useJobPostings);

type MockUseJobPostingsState = {
  data?: PaginatedResponse<JobPostingListItemRead>;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  isPlaceholderData?: boolean;
  error?: Error | null;
  status?: ReturnType<typeof useJobPostings>["status"];
};

function mockUseJobPostings(queryState: MockUseJobPostingsState) {
  useJobPostingsMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
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

function createNotFoundError(
  detail = "Invalid page.",
): AxiosError<{ detail: string }> {
  const error = new AxiosError<{ detail: string }>("Not found");

  error.response = {
    status: 404,
    data: { detail },
  } as AxiosResponse<{ detail: string }>;

  return error;
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
    ordering: "-posted_on",
  };

  function renderJobPostingList(props: Partial<JobPostingListProps> = {}) {
    const mergedProps: JobPostingListProps = {
      params: defaultParams,
      onPageChange,
      ...props,
    };

    return render(
      <MemoryRouter initialEntries={[JOB_POSTINGS_LIST_PATH]}>
        <Routes>
          <Route
            path={JOB_POSTINGS_LIST_PATH}
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

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Error loading job postings.",
    );
  });

  it("renders job list", () => {
    const jobPosting = createJobPostingListItemRead({
      title: "Backend Engineer",
      company: "Acme",
    });

    mockJobPostingsData({ results: [jobPosting] });

    renderJobPostingList();

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(
      screen.getByText(`${jobPosting.company} · ${jobPosting.location}`),
    ).toBeInTheDocument();
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

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  it("shows stale empty results without onboarding after a failed refetch", () => {
    mockJobPostingsData({
      results: [],
      paginationOverrides: { count: 0 },
      queryOverrides: {
        isError: true,
        error: new Error("Refresh failed"),
        status: "error",
      },
    });

    renderJobPostingList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to refresh results. Showing previous data.",
    );

    expect(
      screen.getByText(
        "No job postings in the last successfully loaded results.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/create your first job posting/i),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Create job posting" }),
    ).not.toBeInTheDocument();
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

    expect(detailLink).toHaveAttribute("href", getJobPostingDetailPath(job.id));

    expect(detailLink).toContainElement(
      screen.getByRole("heading", { name: /backend engineer/i }),
    );
  });

  describe("empty states", () => {
    it("shows onboarding guidance when no postings exist", () => {
      mockJobPostingsData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderJobPostingList();

      expect(screen.getByText("No job postings found.")).toBeInTheDocument();

      expect(
        screen.getByText(/create your first job posting/i),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Create job posting" }),
      ).toHaveAttribute("href", JOB_POSTINGS_CREATE_PATH);
    });

    it("shows a no-results message when filters are active", () => {
      mockJobPostingsData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderWithParams({ search: "Python" });

      expect(
        screen.getByText("No job postings match your search or filters."),
      ).toBeInTheDocument();

      expect(
        screen.queryByText(/create your first job posting/i),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: "Create job posting" }),
      ).not.toBeInTheDocument();
    });

    it("ignores whitespace-only search and ordering", () => {
      mockJobPostingsData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderWithParams({
        search: "   ",
        ordering: "company",
      });

      expect(screen.getByText("No job postings found.")).toBeInTheDocument();
    });

    it("recognizes false as an active boolean filter", () => {
      mockJobPostingsData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderWithParams({ easyApply: false });

      expect(
        screen.getByText("No job postings match your search or filters."),
      ).toBeInTheDocument();
    });

    it("does not show onboarding for empty placeholder data", () => {
      mockJobPostingsData({
        results: [],
        paginationOverrides: { count: 0 },
        queryOverrides: {
          isFetching: true,
          isPlaceholderData: true,
        },
      });

      renderWithParams({ search: "React" });

      expect(screen.getByText("Loading page...")).toBeInTheDocument();

      expect(
        screen.queryByText("No job postings match your search or filters."),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: "Create job posting" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("disables previous button when there is no previous page", () => {
      mockJobPostingsData({
        paginationOverrides: { previous: null },
      });

      renderWithParams({ page: 1 });

      expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    });

    it("disables next button when there is no next page", () => {
      mockJobPostingsData({
        paginationOverrides: { next: null },
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
        paginationOverrides: { count: 45 },
      });

      renderWithParams({ page: 2, pageSize: 20 });

      expect(screen.getByText("Page 2 / 3")).toBeInTheDocument();
    });

    it("hides pagination and shows empty state when the list is empty", () => {
      mockJobPostingsData({
        paginationOverrides: { count: 0 },
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

    it("offers recovery when DRF returns 404 for an invalid page", () => {
      mockUseJobPostings({
        isError: true,
        error: createNotFoundError(),
        status: "error",
      });

      renderWithParams({ page: 99 });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "This page is no longer available.",
      );

      fireEvent.click(screen.getByRole("button", { name: "Go to first page" }));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("does not treat unrelated 404 errors as invalid pages", () => {
      mockUseJobPostings({
        isError: true,
        error: createNotFoundError("Not found."),
        status: "error",
      });

      renderWithParams({ page: 99 });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error loading job postings.",
      );

      expect(
        screen.queryByRole("button", { name: "Go to first page" }),
      ).not.toBeInTheDocument();
    });
  });
});
