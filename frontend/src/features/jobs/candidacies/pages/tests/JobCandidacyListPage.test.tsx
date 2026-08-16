// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/tests/JobCandidacyListPage.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobCandidacyFilters } from "../../components/list/JobCandidacyFilters";
import { JobCandidacyList } from "../../components/list/JobCandidacyList";
import { useJobCandidacyFilters } from "../../hooks/useJobCandidacyFilters";
import { JobCandidacyListPage } from "../JobCandidacyListPage";

vi.mock("../../hooks/useJobCandidacyFilters");

vi.mock("../../components/list/JobCandidacyFilters", () => ({
  JobCandidacyFilters: vi.fn(() => <div data-testid="job-candidacy-filters" />),
}));

vi.mock("../../components/list/JobCandidacyList", () => ({
  JobCandidacyList: vi.fn(() => <div data-testid="job-candidacy-list" />),
}));

const jobCandidacyFiltersMock = vi.mocked(JobCandidacyFilters);
const jobCandidacyListMock = vi.mocked(JobCandidacyList);
const useJobCandidacyFiltersMock = vi.mocked(useJobCandidacyFilters);

const setPage = vi.fn();
const updateFilter = vi.fn();
const resetFilters = vi.fn();

function mockFilterState(
  overrides: Partial<ReturnType<typeof useJobCandidacyFilters>> = {},
) {
  useJobCandidacyFiltersMock.mockReturnValue({
    filters: {},
    page: 1,
    setPage,
    updateFilter,
    resetFilters,
    ...overrides,
  });
}

describe("JobCandidacyListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilterState();
  });

  it("renders the page", () => {
    render(<JobCandidacyListPage />);

    expect(
      screen.getByRole("heading", { name: "Job Candidacies" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("job-candidacy-filters")).toBeInTheDocument();
    expect(screen.getByTestId("job-candidacy-list")).toBeInTheDocument();
  });

  it("passes filters separately from list pagination params", () => {
    mockFilterState({
      filters: {
        search: "software engineer",
      },
      page: 3,
    });

    render(<JobCandidacyListPage />);

    const filterProps = jobCandidacyFiltersMock.mock.lastCall?.[0];
    const listProps = jobCandidacyListMock.mock.lastCall?.[0];

    expect(filterProps).toEqual(
      expect.objectContaining({
        params: {
          search: "software engineer",
        },
      }),
    );

    expect(listProps).toEqual(
      expect.objectContaining({
        params: {
          search: "software engineer",
          page: 3,
        },
      }),
    );
  });

  it("wires the filter and pagination callbacks", () => {
    render(<JobCandidacyListPage />);

    const filterProps = jobCandidacyFiltersMock.mock.lastCall?.[0];
    const listProps = jobCandidacyListMock.mock.lastCall?.[0];

    expect(filterProps).toEqual(
      expect.objectContaining({
        updateFilter,
        resetFilters,
      }),
    );

    expect(listProps).toEqual(
      expect.objectContaining({
        onPageChange: setPage,
      }),
    );
  });
});
