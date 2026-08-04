// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/tests/JobCandidacyCreatePage.test.tsx

import { render, screen } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getJobPostingDetailPath } from "@/features/jobs/postings/constants";
import { useJobPosting } from "@/features/jobs/postings/hooks/useJobPosting";
import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";
import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";

import { JobCandidacyForm } from "../../components/form/JobCandidacyForm";
import {
  getJobCandidacyDetailPath,
  JOB_CANDIDACIES_LIST_PATH,
} from "../../constants";
import { useCreateJobCandidacy } from "../../hooks/useCreateJobCandidacy";
import { JobCandidacyCreatePage } from "../JobCandidacyCreatePage";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof ReactRouterDom>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock("@/features/jobs/postings/hooks/useJobPosting", () => ({
  useJobPosting: vi.fn(),
}));

vi.mock("../../hooks/useCreateJobCandidacy", () => ({
  useCreateJobCandidacy: vi.fn(),
}));

vi.mock("../../components/form/JobCandidacyForm", () => ({
  JobCandidacyForm: vi.fn(() => (
    <div data-testid="job-candidacy-form">Job candidacy form</div>
  )),
}));

const useJobPostingMock = vi.mocked(useJobPosting);
const useCreateJobCandidacyMock = vi.mocked(useCreateJobCandidacy);
const JobCandidacyFormMock = vi.mocked(JobCandidacyForm);

function renderPage(
  initialEntry = "/jobs/candidacies/new?jobPostingId=job-123",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <JobCandidacyCreatePage />
    </MemoryRouter>,
  );
}

function mockJobPostingQuery(
  overrides: Partial<ReturnType<typeof useJobPosting>> = {},
) {
  useJobPostingMock.mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    ...overrides,
  } as ReturnType<typeof useJobPosting>);
}

function mockCreateJobCandidacy(
  overrides: Partial<ReturnType<typeof useCreateJobCandidacy>> = {},
) {
  useCreateJobCandidacyMock.mockReturnValue({
    isError: false,
    isPending: false,
    mutate: mocks.mutate,
    ...overrides,
  } as ReturnType<typeof useCreateJobCandidacy>);
}

function createAxiosError(status: number) {
  return {
    isAxiosError: true,
    message: "Request failed",
    name: "AxiosError",
    response: { status },
  };
}

function getFormProps() {
  const calls = JobCandidacyFormMock.mock.calls;
  const call = calls[calls.length - 1];

  if (!call) {
    throw new Error("Expected JobCandidacyForm to have been rendered.");
  }

  return call[0];
}

describe("JobCandidacyCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockJobPostingQuery({
      data: createJobPostingDetailRead({
        id: "job-123",
        title: "Frontend Developer",
        company: "Acme",
        location: "Paris",
        candidacy_id: null,
      }),
    });

    mockCreateJobCandidacy();
  });

  it("shows an error when the job posting identifier is missing", () => {
    renderPage("/jobs/candidacies/new");

    expect(useJobPostingMock).toHaveBeenCalledWith("");

    expect(
      screen.getByRole("heading", { name: "Create Job Candidacy" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid job posting identifier.",
    );

    expect(
      screen.getByRole("link", { name: /back to candidacies/i }),
    ).toHaveAttribute("href", JOB_CANDIDACIES_LIST_PATH);

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("trims the job posting identifier from the query string", () => {
    renderPage("/jobs/candidacies/new?jobPostingId=%20job-123%20");

    expect(useJobPostingMock).toHaveBeenCalledWith("job-123");
    expect(screen.getByTestId("job-candidacy-form")).toBeInTheDocument();
  });

  it("shows the loading state", () => {
    mockJobPostingQuery({
      data: undefined,
      isLoading: true,
    });

    renderPage();

    const loadingMessage = screen.getByText("Loading job posting...");

    expect(loadingMessage.closest("section")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(
      screen.getByRole("link", { name: /back to job posting/i }),
    ).toHaveAttribute("href", getJobPostingDetailPath("job-123"));

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows the not-found state when the query has no data", () => {
    mockJobPostingQuery({
      data: undefined,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Job posting not found.",
    );

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows the not-found state for a 404 response", () => {
    mockJobPostingQuery({
      data: undefined,
      error: createAxiosError(404),
      isError: true,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Job posting not found.",
    );
  });

  it("shows a generic error for other query failures", () => {
    mockJobPostingQuery({
      data: undefined,
      error: createAxiosError(500),
      isError: true,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load job posting.",
    );
  });

  it("prevents creation when the job posting already has a candidacy", () => {
    mockJobPostingQuery({
      data: createJobPostingDetailRead({
        id: "job-123",
        candidacy_id: "candidacy-9",
      }),
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This job posting already has a candidacy.",
    );

    expect(
      screen.getByRole("link", { name: /see.*candidacy/i }),
    ).toHaveAttribute("href", getJobCandidacyDetailPath("candidacy-9"));

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("renders the job posting summary and candidacy form", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Frontend Developer" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByTestId("job-candidacy-form")).toBeInTheDocument();

    expect(getFormProps()).toEqual(
      expect.objectContaining({
        initialValues: {
          status: "applied",
          applied_on: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          notes: "",
        },
        isSubmitting: false,
        error: undefined,
        submitLabel: "Create job candidacy",
        submittingLabel: "Creating...",
        onSubmit: expect.any(Function),
      }),
    );
  });

  it("passes the pending mutation state to the form", () => {
    mockCreateJobCandidacy({
      isPending: true,
      status: "pending",
    });

    renderPage();

    expect(getFormProps()).toEqual(
      expect.objectContaining({
        isSubmitting: true,
        error: undefined,
      }),
    );
  });

  it("passes the mutation error to the form", () => {
    const error = new Error("Could not create job candidacy.");

    mockCreateJobCandidacy({
      error,
      isError: true,
      isPending: false,
      status: "error",
    });

    renderPage();

    expect(getFormProps()).toEqual(
      expect.objectContaining({
        isSubmitting: false,
        error: "Could not create job candidacy.",
      }),
    );
  });

  it("creates the candidacy and navigates to its detail page", () => {
    renderPage();

    getFormProps().onSubmit({
      status: "applied",
      applied_on: "2026-08-04",
      notes: "  Follow up next week.  ",
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        job_posting: "job-123",
        status: "applied",
        applied_on: "2026-08-04",
        notes: "Follow up next week.",
      },
      {
        onSuccess: expect.any(Function),
      },
    );

    expect(mocks.navigate).not.toHaveBeenCalled();

    const createdCandidacy = createJobCandidacyDetailRead({
      id: "candidacy-42",
    });

    const mutationOptions = mocks.mutate.mock.calls[0]?.[1] as
      | {
          onSuccess: (candidacy: typeof createdCandidacy) => void;
        }
      | undefined;

    expect(mutationOptions).toBeDefined();

    mutationOptions?.onSuccess(createdCandidacy);

    expect(mocks.navigate).toHaveBeenCalledWith(
      getJobCandidacyDetailPath("candidacy-42"),
      { replace: true },
    );
  });
});
