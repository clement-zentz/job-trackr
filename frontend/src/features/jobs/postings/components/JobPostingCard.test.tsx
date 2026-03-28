// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCard.test.tsx

import { render, screen } from "@testing-library/react";
import { JobPostingCard } from "./JobPostingCard";
import { describe, it, expect } from "vitest";

const baseJob = {
  id: "myid123",
  title: "Backend Engineer",
  company: "Acme",
  location: "Paris",
  platform: "linkedin",
  raw_url: "https://example.com/123",
  canonical_url: "https://example.com/123",
  posted_at: "2025-01-01T10:00:00Z",
};

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

  it("shows fallback when date is null", () => {
    render(<JobPostingCard job={{ ...baseJob, posted_at: null }} />);

    expect(screen.getByText("Posting date unknown")).toBeInTheDocument();
  });
});
