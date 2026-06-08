// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingDetail.test.tsx

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JobPostingDetail } from "../JobPostingDetail";
import type { JobPostingDetailRead } from "../../types";

import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";

vi.mock("../utils", () => ({
  formatDate: vi.fn(() => "June 7, 2026, 14:30"),
  formatUrlForDisplay: vi.fn(() => "linkedin.com/jobs/view/123"),
}));

const baseJobPosting: JobPostingDetailRead = createJobPostingDetailRead({
  id: "1",
  title: "Frontend Developer",
  company: "Acme Corp",
  location: "Paris, France",
  url: "https://www.linkedin.com/jobs/view/123",
  salary: "€45,000 - €55,000",
  platform: "linkedin",
  platform_label: "LinkedIn",
  employment_type: "full_time",
  employment_type_label: "Full time",
  work_mode: "remote",
  work_mode_label: "Remote",
  easy_apply: true,
  active_hiring: false,
  posted_at: "2026-06-07T14:30:00Z",
  description: "Build React features for a job tracking application.",
  description_preview: "Build React features for a job tracking application.",
});

describe("JobPostingDetail", () => {
  it("renders the main job posting information", () => {
    render(<JobPostingDetail jobPosting={baseJobPosting} />);

    expect(
      screen.getByRole("heading", {
        name: "Frontend Developer",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
  });

  it("renders the job posting metadata", () => {
    render(<JobPostingDetail jobPosting={baseJobPosting} />);

    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();

    expect(screen.getByText("Employment type")).toBeInTheDocument();
    expect(screen.getByText("Full time")).toBeInTheDocument();

    expect(screen.getByText("Work mode")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("€45,000 - €55,000")).toBeInTheDocument();

    expect(screen.getByText("Posted at")).toBeInTheDocument();
    expect(screen.getByText("June 7, 2026, 14:30")).toBeInTheDocument();
  });

  it("renders the job posting URL as an external link", () => {
    render(<JobPostingDetail jobPosting={baseJobPosting} />);

    const link = screen.getByRole("link", {
      name: "linkedin.com/jobs/view/123",
    });

    expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/jobs/view/123",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute(
      "title",
      "https://www.linkedin.com/jobs/view/123",
    );
  });

  it("renders boolean fields as human-readable values", () => {
    render(<JobPostingDetail jobPosting={baseJobPosting} />);

    expect(screen.getByText("Easy apply")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();

    expect(screen.getByText("Active hiring")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders the description when present", () => {
    render(<JobPostingDetail jobPosting={baseJobPosting} />);

    expect(
      screen.getByRole("heading", {
        name: "Description",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Build React features for a job tracking application."),
    ).toBeInTheDocument();
  });

  it("does not render optional fields when they are missing", () => {
    const jobPostingWithoutOptionalFields: JobPostingDetailRead = {
      ...baseJobPosting,
      url: "",
      salary: "",
      posted_at: null,
      description: "",
    };

    render(<JobPostingDetail jobPosting={jobPostingWithoutOptionalFields} />);

    expect(screen.queryByText("URL")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.queryByText("Posted at")).not.toBeInTheDocument();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });
});
