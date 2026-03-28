// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingList.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingList } from "./JobPostingList";
import * as hook from "../hooks/useJobPostings";
import { describe, it, expect, vi } from "vitest";

describe("JobPostingList", () => {
  it("renders loading state", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList />);

    expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument();
  });

  it("renders job list", () => {
    vi.spyOn(hook, "useJobPostings").mockReturnValue({
      data: [
        {
          id: "myid123",
          title: "Frontend Dev",
          company: "Acme",
          location: "Paris",
          platform: "linkedin",
          posted_at: "2025-01-01T10:00:00Z",
        },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof hook.useJobPostings>);

    render(<JobPostingList />);

    expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});
