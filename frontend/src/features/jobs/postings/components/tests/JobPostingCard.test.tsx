// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingCard.test.tsx

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createJobPostingListItemRead } from "@/tests/factories/jobPosting";

import { JobPostingCard } from "../list/JobPostingCard";
import type * as Utils from "../utils";

vi.mock("../utils", async () => {
  const actual = await vi.importActual<typeof Utils>("../utils");

  return {
    ...actual,
    formatDateTimeForDisplay: vi.fn((value: string) => `Formatted ${value}`),
    formatUrlForDisplay: vi.fn(() => "example.com/1"),
  };
});

const baseJob = createJobPostingListItemRead({
  title: "Backend Engineer",
  company: "Acme",
  location: "Paris",
  url: "https://example.com/1",
  description_preview: "Build APIs and background jobs.",
  salary: "45k-55k",
  easy_apply: true,
  active_hiring: true,
  platform: "linkedin",
  platform_label: "LinkedIn",
  employment_type: "full_time",
  employment_type_label: "Full-time",
  work_mode: "hybrid",
  work_mode_label: "Hybrid",
  candidacy_id: "candidacy-1",
  posted_at: "2026-01-01T09:00:00Z",
  created_at: "2026-01-01T10:00:00Z",
  updated_at: "2026-01-01T11:00:00Z",
});

function renderJobPostingCard(overrides: Partial<typeof baseJob> = {}) {
  return render(<JobPostingCard job={{ ...baseJob, ...overrides }} />);
}

describe("JobPostingCard", () => {
  it("renders the main job information", () => {
    renderJobPostingCard();

    expect(
      screen.getByRole("heading", { name: "Backend Engineer" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme · Paris")).toBeInTheDocument();
  });

  it("renders the badges", () => {
    renderJobPostingCard();

    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Easy Apply")).toBeInTheDocument();
    expect(screen.getByText("Active Hiring")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("renders optional job data when present", () => {
    renderJobPostingCard();

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("45k-55k")).toBeInTheDocument();

    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByTestId("job-posting-url")).toHaveAttribute(
      "title",
      "https://example.com/1",
    );
    expect(screen.getByTestId("job-posting-url")).toHaveTextContent(
      /^example\.com\/1$/,
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("Build APIs and background jobs."),
    ).toBeInTheDocument();

    expect(screen.getByText(/Posted at/)).toBeInTheDocument();
    expect(screen.getByTestId("posted-at")).toHaveTextContent(
      "Formatted 2026-01-01T09:00:00Z",
    );
  });

  it("renders created and updated dates", () => {
    renderJobPostingCard();

    expect(screen.getByText(/Created at:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated at:/)).toBeInTheDocument();

    expect(screen.getByText(`Formatted ${baseJob.created_at}`)).toHaveAttribute(
      "datetime",
      baseJob.created_at,
    );
    expect(screen.getByText(`Formatted ${baseJob.updated_at}`)).toHaveAttribute(
      "datetime",
      baseJob.updated_at,
    );
  });

  it("does not render empty optional job data", () => {
    renderJobPostingCard({
      url: "",
      salary: "",
      description_preview: "",
      posted_at: null,
    });

    expect(screen.queryByText("URL")).not.toBeInTheDocument();
    expect(screen.queryByTestId("job-posting-url")).not.toBeInTheDocument();

    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();

    expect(screen.queryByText("Posted at")).not.toBeInTheDocument();
    expect(screen.queryByTestId("posted-at")).not.toBeInTheDocument();
  });

  it("does not render empty badges", () => {
    renderJobPostingCard({
      platform_label: "",
      employment_type_label: " ",
      work_mode_label: "",
      easy_apply: false,
      active_hiring: false,
      candidacy_id: null,
    });

    expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
    expect(screen.queryByText("Full-time")).not.toBeInTheDocument();
    expect(screen.queryByText("Hybrid")).not.toBeInTheDocument();
    expect(screen.queryByText("Easy Apply")).not.toBeInTheDocument();
    expect(screen.queryByText("Active Hiring")).not.toBeInTheDocument();
    expect(screen.queryByText("Applied")).not.toBeInTheDocument();
  });

  it("does not render nested links", () => {
    renderJobPostingCard();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
