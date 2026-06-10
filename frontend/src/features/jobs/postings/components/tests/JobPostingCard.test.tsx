// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingCard.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingCard } from "../JobPostingCard";
import { describe, it, expect } from "vitest";
import { createJobPostingListItemRead } from "@/tests/factories/jobPosting";

const baseJob = createJobPostingListItemRead();

function renderJobPostingCard(overrides: Partial<typeof baseJob> = {}) {
  return render(<JobPostingCard job={{ ...baseJob, ...overrides }} />);
}

describe("JobPostingCard", () => {
  it("renders job information", () => {
    renderJobPostingCard({
      url: "https://example.com/1",
      posted_at: "2026-01-01T10:00:00Z",
      platform: "linkedin",
      platform_label: "LinkedIn",
    });

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByTestId("job-posting-url")).toHaveTextContent(
      "example.com",
    );
  });

  it("does not render url element when url is empty", () => {
    renderJobPostingCard({ url: "" });

    expect(screen.queryByTestId("job-posting-url")).not.toBeInTheDocument();
  });

  it("does not render date element when posted_at is null", () => {
    renderJobPostingCard({ posted_at: null });

    expect(screen.queryByTestId("job-posting-date")).not.toBeInTheDocument();
  });

  it("does not render nested links", () => {
    renderJobPostingCard();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
