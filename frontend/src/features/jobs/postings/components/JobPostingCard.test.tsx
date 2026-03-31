// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingCard } from "./JobPostingCard";
import { describe, it, expect } from "vitest";
import { createJobPosting } from "@/tests/factories/jobPosting";

const baseJob = createJobPosting();

describe("JobPostingCard", () => {
  it("renders job information", () => {
    render(<JobPostingCard job={baseJob} />);

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("linkedin")).toBeInTheDocument();
  });

  it("shows fallback when location is null", () => {
    render(<JobPostingCard job={{ ...baseJob, location: null }} />);

    expect(screen.getByText("Location unknown")).toBeInTheDocument();
  });

  it("does not render date element when posted_at is null", () => {
    render(<JobPostingCard job={{ ...baseJob, posted_at: null }} />);

    expect(screen.queryByTestId("job-posting-date")).not.toBeInTheDocument();
  });
});
