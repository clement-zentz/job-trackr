// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/tests/JobPostingUpdatePage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";

import { JobPostingUpdatePage } from "../JobPostingUpdatePage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useParams: vi.fn(),
  useJobPosting: vi.fn(),
  useUpdateJobPosting: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof ReactRouterDom>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useParams: mocks.useParams,
  };
});

vi.mock("../../hooks/useJobPosting", () => ({
  useJobPosting: mocks.useJobPosting,
}));

vi.mock("../../hooks/useUpdateJobPosting", () => ({
  useUpdateJobPosting: mocks.useUpdateJobPosting,
}));

function renderPage() {
  render(
    <MemoryRouter>
      <JobPostingUpdatePage />
    </MemoryRouter>,
  );
}

describe("JobPostingUpdatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useParams.mockReturnValue({ id: "job-123" });

    mocks.useJobPosting.mockReturnValue({
      isLoading: false,
      isError: false,
      data: createJobPostingDetailRead({
        id: "job-123",
        title: "Frontend Developer",
        company: "Acme",
        location: "Paris",
        url: "https://example.com/jobs/frontend-developer",
        salary: "50k - 60k",
        description: "Work on a React frontend.",
        easy_apply: true,
        active_hiring: false,
        platform: "wttj",
        employment_type: "full_time",
        work_mode: "remote",
        posted_at: "2026-07-07",
      }),
    });

    mocks.useUpdateJobPosting.mockReturnValue({
      isPending: false,
      error: null,
      mutate: mocks.mutate,
    });
  });

  it("shows an error when the job posting ID is missing", () => {
    mocks.useParams.mockReturnValue({});

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Update Job Posting" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Job posting ID is missing.")).toBeInTheDocument();
    expect(mocks.useJobPosting).toHaveBeenCalledWith(undefined);
  });

  it("shows the loading state", () => {
    mocks.useJobPosting.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    renderPage();

    expect(screen.getByText("Loading job posting...")).toBeInTheDocument();
  });

  it("shows an error when the job posting cannot be loaded", () => {
    mocks.useJobPosting.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    renderPage();

    expect(screen.getByText("Could not load job posting.")).toBeInTheDocument();
  });

  it("renders the loaded job posting and submits an update", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByDisplayValue("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Paris")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Back to job posting" }),
    ).toHaveAttribute("href", "/jobs/postings/job-123");

    await user.click(screen.getByRole("button", { name: "Save Job Posting" }));

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        id: "job-123",
        payload: {
          title: "Frontend Developer",
          company: "Acme",
          location: "Paris",

          url: "https://example.com/jobs/frontend-developer",
          salary: "50k - 60k",
          description: "Work on a React frontend.",

          easy_apply: true,
          active_hiring: false,

          platform: "wttj",
          employment_type: "full_time",
          work_mode: "remote",

          posted_at: "2026-07-07",
        },
      },
      {
        onSuccess: expect.any(Function),
      },
    );

    const [, options] = mocks.mutate.mock.calls[0];

    options.onSuccess();

    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/postings/job-123", {
      replace: true,
    });
  });

  it("shows the update error message", () => {
    mocks.useUpdateJobPosting.mockReturnValue({
      isPending: false,
      error: new Error("Update failed"),
      mutate: mocks.mutate,
    });

    renderPage();

    expect(
      screen.getByText("Could not update job posting."),
    ).toBeInTheDocument();
  });
});
