// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingList } from "./JobPostingList";
import * as hook from "../hooks/useJobPostings";
import { describe, it, expect, vi } from "vitest";
import { createJobPosting } from "@/tests/factories/jobPosting";

describe("JobPostingList", () => {
  it("renders loading state", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
      error: null,
      status: "pending",
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList />);

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

    render(<JobPostingList />);

    expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
  });

  it("renders job list", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: [createJobPosting()],
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
      status: "success",
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList />);

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});
