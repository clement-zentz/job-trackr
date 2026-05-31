// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingCard.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingCard } from "../JobPostingCard";
import { describe, it, expect } from "vitest";
import { createJobPostingRead } from "@/tests/factories/jobPosting";

const baseJob = createJobPostingRead();

describe("JobPostingCard", () => {
  it("renders job information", () => {
    render(
      <JobPostingCard
        job={{
          ...baseJob,
          url: "https://example.com/1",
          posted_at: "2026-01-01T10:00:00Z",
          platform: "linkedin",
          platform_label: "LinkedIn",
        }}
      />,
    );

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("does not render url element when url is empty", () => {
    render(<JobPostingCard job={{ ...baseJob, url: "" }} />);

    expect(screen.queryByTestId("job-posting-url")).not.toBeInTheDocument();
  });

  it("does not render date element when posted_at is null", () => {
    render(<JobPostingCard job={{ ...baseJob, posted_at: null }} />);

    expect(screen.queryByTestId("job-posting-date")).not.toBeInTheDocument();
  });
});
