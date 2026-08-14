// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/tests/JobCandidacyListPage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobCandidacyList } from "../../components/list/JobCandidacyList";
import { JobCandidacyListPage } from "../JobCandidacyListPage";

type MockJobCandidacyListProps = {
  onPageChange: (page: number) => void;
};

vi.mock("../../components/list/JobCandidacyList", () => ({
  JobCandidacyList: vi.fn(({ onPageChange }: MockJobCandidacyListProps) => (
    <button type="button" onClick={() => onPageChange(2)}>
      Go to page 2
    </button>
  )),
}));

const jobCandidacyListMock = vi.mocked(JobCandidacyList);

describe("JobCandidacyListPage", () => {
  beforeEach(() => {
    jobCandidacyListMock.mockClear();
  });

  it("renders the page and manages pagination state", async () => {
    const user = userEvent.setup();

    render(<JobCandidacyListPage />);

    expect(
      screen.getByRole("heading", { name: "Job Candidacies" }),
    ).toBeInTheDocument();

    expect(jobCandidacyListMock.mock.calls.at(-1)?.[0].params).toEqual({
      page: 1,
    });

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(jobCandidacyListMock.mock.calls.at(-1)?.[0].params).toEqual({
      page: 2,
    });
  });
});
