// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/tests/JobCandidacyList.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import type { ComponentProps } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  JOB_POSTINGS_CREATE_PATH,
  JOB_POSTINGS_LIST_PATH,
} from "@/features/jobs/postings/constants";
import { createJobCandidacyListItemRead } from "@/tests/factories/jobCandidacy";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import type { PaginatedResponse } from "@/types/pagination";

import {
  DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
  getJobCandidacyDetailPath,
  JOB_CANDIDACIES_LIST_PATH,
} from "../../../constants";
import { useJobCandidacies } from "../../../hooks/useJobCandidacies";
import type {
  JobCandidacyListItemRead,
  JobCandidacyListParams,
} from "../../../types";
import { JobCandidacyList } from "../../list/JobCandidacyList";
import type { JobCandidacyPagination } from "../../list/JobCandidacyPagination";

type MockPaginationProps = ComponentProps<typeof JobCandidacyPagination>;

const { jobCandidacyPaginationMock } = vi.hoisted(() => ({
  jobCandidacyPaginationMock: vi.fn(),
}));

vi.mock("../../../hooks/useJobCandidacies", () => ({
  useJobCandidacies: vi.fn(),
}));

vi.mock("../../list/JobCandidacyCard", () => ({
  JobCandidacyCard: ({
    candidacy,
  }: {
    candidacy: JobCandidacyListItemRead;
  }) => <article data-testid="job-candidacy-card">{candidacy.id}</article>,
}));

vi.mock("../../list/JobCandidacyPagination", () => ({
  JobCandidacyPagination: (props: MockPaginationProps) => {
    jobCandidacyPaginationMock(props);

    return <div data-testid="job-candidacy-pagination" />;
  },
}));

const useJobCandidaciesMock = vi.mocked(useJobCandidacies);

type MockUseJobCandidaciesState = {
  data?: PaginatedResponse<JobCandidacyListItemRead>;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  isPlaceholderData?: boolean;
  error?: Error | null;
  status?: ReturnType<typeof useJobCandidacies>["status"];
};

type MockJobCandidaciesDataOptions = {
  results?: JobCandidacyListItemRead[];
  paginationOverrides?: Partial<PaginatedResponse<JobCandidacyListItemRead>>;
  queryOverrides?: Omit<MockUseJobCandidaciesState, "data">;
};

function mockUseJobCandidacies(queryState: MockUseJobCandidaciesState) {
  useJobCandidaciesMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    error: null,
    status: "success",
    ...queryState,
  } as ReturnType<typeof useJobCandidacies>);
}

function mockJobCandidaciesData({
  results = [createJobCandidacyListItemRead()],
  paginationOverrides = {},
  queryOverrides = {},
}: MockJobCandidaciesDataOptions = {}) {
  mockUseJobCandidacies({
    data: createPaginatedResponse(results, paginationOverrides),
    ...queryOverrides,
  });
}

function createNotFoundError(
  detail = "Invalid page.",
): AxiosError<{ detail: string }> {
  const error = new AxiosError<{ detail: string }>("Not Found");

  error.response = {
    status: 404,
    data: { detail },
  } as AxiosResponse<{ detail: string }>;

  return error;
}

describe("JobCandidacyList", () => {
  let onPageChange: Mock<(page: number) => void>;

  const defaultParams = {
    page: 1,
  } satisfies JobCandidacyListParams;

  beforeEach(() => {
    onPageChange = vi.fn<(page: number) => void>();

    useJobCandidaciesMock.mockReset();
    jobCandidacyPaginationMock.mockReset();
  });

  function renderJobCandidacyList(
    params: JobCandidacyListParams = defaultParams,
  ) {
    return render(
      <MemoryRouter initialEntries={[JOB_CANDIDACIES_LIST_PATH]}>
        <Routes>
          <Route path={JOB_CANDIDACIES_LIST_PATH}>
            <Route
              index
              element={
                <JobCandidacyList params={params} onPageChange={onPageChange} />
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("passes the list parameters to the query hook", () => {
    mockJobCandidaciesData();

    renderJobCandidacyList(defaultParams);

    expect(useJobCandidaciesMock).toHaveBeenCalledOnce();
    expect(useJobCandidaciesMock).toHaveBeenCalledWith(defaultParams);
  });

  it("renders the initial loading state", () => {
    mockUseJobCandidacies({
      isLoading: true,
      isFetching: true,
      status: "pending",
    });

    renderJobCandidacyList();

    expect(screen.getByText("Loading candidacies...")).toBeInTheDocument();

    expect(screen.queryByTestId("job-candidacy-card")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId("job-candidacy-pagination"),
    ).not.toBeInTheDocument();
  });

  it("renders the blocking error state when no data is available", () => {
    mockUseJobCandidacies({
      isError: true,
      error: new Error("Request failed"),
      status: "error",
    });

    renderJobCandidacyList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Error loading candidacies.",
    );

    expect(screen.queryByTestId("job-candidacy-card")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId("job-candidacy-pagination"),
    ).not.toBeInTheDocument();
  });

  it("renders one card for each candidacy", () => {
    const firstCandidacy = createJobCandidacyListItemRead({
      id: "candidacy-1",
      job_posting: { id: "job-1" },
    });

    const secondCandidacy = createJobCandidacyListItemRead({
      id: "candidacy-2",
      job_posting: { id: "job-2" },
    });

    mockJobCandidaciesData({
      results: [firstCandidacy, secondCandidacy],
    });

    renderJobCandidacyList();

    expect(screen.getAllByTestId("job-candidacy-card")).toHaveLength(2);

    expect(screen.getByText("candidacy-1")).toBeInTheDocument();
    expect(screen.getByText("candidacy-2")).toBeInTheDocument();
  });

  describe("empty states", () => {
    it("shows onboarding guidance when no candidacies exist", () => {
      mockJobCandidaciesData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderJobCandidacyList();

      expect(screen.getByText("No job candidacies found.")).toBeInTheDocument();

      expect(
        screen.getByText(/create a job posting or select an existing one/i),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Create job posting" }),
      ).toHaveAttribute("href", JOB_POSTINGS_CREATE_PATH);

      expect(
        screen.getByRole("link", { name: "See job postings" }),
      ).toHaveAttribute("href", JOB_POSTINGS_LIST_PATH);

      expect(
        screen.queryByTestId("job-candidacy-card"),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId("job-candidacy-pagination"),
      ).not.toBeInTheDocument();

      expect(jobCandidacyPaginationMock).not.toHaveBeenCalled();
    });

    it("shows a no-results message when filters are active", () => {
      mockJobCandidaciesData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderJobCandidacyList({
        page: 1,
        search: "React",
      });

      expect(
        screen.getByText("No job candidacies match your search or filters."),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: "Create job posting" }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: "See job postings" }),
      ).not.toBeInTheDocument();
    });

    it("ignores whitespace-only search and ordering", () => {
      mockJobCandidaciesData({
        results: [],
        paginationOverrides: { count: 0 },
      });

      renderJobCandidacyList({
        page: 1,
        search: "   ",
        ordering: "-applied_on",
      });

      expect(screen.getByText("No job candidacies found.")).toBeInTheDocument();
    });

    it("does not show onboarding for empty placeholder data", () => {
      mockJobCandidaciesData({
        results: [],
        paginationOverrides: { count: 0 },
        queryOverrides: {
          isFetching: true,
          isPlaceholderData: true,
        },
      });

      renderJobCandidacyList({
        page: 1,
        search: "Python",
      });

      expect(screen.getByText("Loading page...")).toBeInTheDocument();

      expect(
        screen.queryByText("No job candidacies match your search or filters."),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: "Create job posting" }),
      ).not.toBeInTheDocument();
    });
  });

  it("does not show onboarding when an empty cached result fails to refresh", () => {
    mockJobCandidaciesData({
      results: [],
      paginationOverrides: { count: 0 },
      queryOverrides: {
        isError: true,
        error: new Error("Refresh failed"),
        status: "error",
      },
    });

    renderJobCandidacyList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to refresh candidacies. Showing previous data.",
    );

    expect(
      screen.getByText(
        "No job candidacies in the last successfully loaded results.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Create job posting" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "See job postings" }),
    ).not.toBeInTheDocument();
  });

  it("shows a refresh error while preserving previous results", () => {
    const candidacy = createJobCandidacyListItemRead({
      id: "cached-candidacy",
    });

    mockJobCandidaciesData({
      results: [candidacy],
      queryOverrides: {
        isError: true,
        error: new Error("Refresh failed"),
        status: "error",
      },
    });

    renderJobCandidacyList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to refresh candidacies. Showing previous data.",
    );

    expect(screen.getByText("cached-candidacy")).toBeInTheDocument();

    expect(screen.getByTestId("job-candidacy-pagination")).toBeInTheDocument();
  });

  it("shows the page loading state while preserving previous results", () => {
    const candidacy = createJobCandidacyListItemRead({
      id: "cached-candidacy",
    });

    mockJobCandidaciesData({
      results: [candidacy],
      queryOverrides: { isFetching: true },
    });

    renderJobCandidacyList();

    expect(screen.getByText("Loading page...")).toBeInTheDocument();
    expect(screen.getByText("cached-candidacy")).toBeInTheDocument();
  });

  it("passes the pagination state to JobCandidacyPagination", () => {
    mockJobCandidaciesData({
      paginationOverrides: {
        count: 45,
        previous: "http://api.test/candidacies?page=1",
        next: "http://api.test/candidacies?page=3",
      },
      queryOverrides: { isFetching: true },
    });

    renderJobCandidacyList({ page: 2 });

    expect(jobCandidacyPaginationMock).toHaveBeenCalledOnce();

    expect(jobCandidacyPaginationMock).toHaveBeenCalledWith({
      currentPage: 2,
      totalPages: 5,
      hasPreviousPage: true,
      hasNextPage: true,
      isFetching: true,
      onPageChange,
    });
  });

  it("uses the default pagination values when params are omitted", () => {
    mockJobCandidaciesData({
      paginationOverrides: {
        count: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE + 1,
        previous: null,
        next: "http://api.test/candidacies?page=2",
      },
    });

    renderJobCandidacyList({});

    expect(jobCandidacyPaginationMock).toHaveBeenCalledOnce();

    expect(jobCandidacyPaginationMock).toHaveBeenCalledWith({
      currentPage: 1,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
      isFetching: false,
      onPageChange,
    });
  });

  it("links each candidacy to its detail page", () => {
    const candidacy = createJobCandidacyListItemRead({
      id: "42",
    });

    mockJobCandidaciesData({
      results: [candidacy],
    });

    renderJobCandidacyList();

    expect(
      screen.getByRole("link", {
        name: `View details for ${candidacy.job_posting.title} at ${candidacy.job_posting.company}`,
      }),
    ).toHaveAttribute("href", getJobCandidacyDetailPath(candidacy.id));
  });

  describe("invalid page recovery", () => {
    it("offers recovery when DRF returns HTTP 404", () => {
      mockUseJobCandidacies({
        isError: true,
        error: createNotFoundError(),
        status: "error",
      });

      renderJobCandidacyList({ page: 99 });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "This page is no longer available.",
      );

      fireEvent.click(screen.getByRole("button", { name: "Go to first page" }));

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("prioritizes invalid-page recovery over cached results", () => {
      mockJobCandidaciesData({
        results: [
          createJobCandidacyListItemRead({
            id: "cached-candidacy",
          }),
        ],
        paginationOverrides: {
          count: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE + 1,
          previous: "http://api.test/candidacies?page=1",
        },
        queryOverrides: {
          isError: true,
          error: createNotFoundError(),
          status: "error",
        },
      });

      renderJobCandidacyList({ page: 2 });

      expect(
        screen.getByRole("button", { name: "Go to first page" }),
      ).toBeInTheDocument();

      expect(screen.queryByText("cached-candidacy")).not.toBeInTheDocument();
    });

    it("does not treat an unrelated error as an invalid page", () => {
      mockUseJobCandidacies({
        isError: true,
        error: new Error("Network unavailable"),
        status: "error",
      });

      renderJobCandidacyList({ page: 2 });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error loading candidacies.",
      );

      expect(
        screen.queryByRole("button", { name: "Go to first page" }),
      ).not.toBeInTheDocument();
    });

    it("does not treat an unrelated HTTP 404 as an invalid page", () => {
      mockUseJobCandidacies({
        isError: true,
        error: createNotFoundError("Not found."),
        status: "error",
      });

      renderJobCandidacyList({ page: 2 });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error loading candidacies.",
      );

      expect(
        screen.queryByRole("button", {
          name: "Go to first page",
        }),
      ).not.toBeInTheDocument();
    });
  });
});
