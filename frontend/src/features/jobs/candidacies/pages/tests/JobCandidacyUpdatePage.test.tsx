// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/pages/tests/JobCandidacyUpdatePage.test.tsx

import { render, screen } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";

import { JobCandidacyForm } from "../../components/form/JobCandidacyForm";
import {
  getJobCandidacyDetailPath,
  getJobCandidacyEditPath,
  JOB_CANDIDACIES_LIST_PATH,
  JOB_CANDIDACY_EDIT_PATH,
} from "../../constants";
import { useJobCandidacy } from "../../hooks/useJobCandidacy";
import { useUpdateJobCandidacy } from "../../hooks/useUpdateJobCandidacy";
import { JobCandidacyUpdatePage } from "../JobCandidacyUpdatePage";

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

vi.mock("../../hooks/useJobCandidacy", () => ({
  useJobCandidacy: vi.fn(),
}));

vi.mock("../../hooks/useUpdateJobCandidacy", () => ({
  useUpdateJobCandidacy: vi.fn(),
}));

vi.mock("../../components/form/JobCandidacyForm", () => ({
  JobCandidacyForm: vi.fn(() => (
    <div data-testid="job-candidacy-form">Job candidacy form</div>
  )),
}));

const useJobCandidacyMock = vi.mocked(useJobCandidacy);
const useUpdateJobCandidacyMock = vi.mocked(useUpdateJobCandidacy);
const JobCandidacyFormMock = vi.mocked(JobCandidacyForm);

function renderPage(initialEntry = getJobCandidacyEditPath("candidacy-1")) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path={JOB_CANDIDACY_EDIT_PATH}
          element={<JobCandidacyUpdatePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

function mockCandidacyQuery(
  overrides: Partial<ReturnType<typeof useJobCandidacy>> = {},
) {
  useJobCandidacyMock.mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    ...overrides,
  } as ReturnType<typeof useJobCandidacy>);
}

function mockUpdateJobCandidacy(
  overrides: Partial<ReturnType<typeof useUpdateJobCandidacy>> = {},
) {
  useUpdateJobCandidacyMock.mockReturnValue({
    isError: false,
    isPending: false,
    mutate: mocks.mutate,
    ...overrides,
  } as ReturnType<typeof useUpdateJobCandidacy>);
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

describe("JobCandidacyUpdatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCandidacyQuery({
      data: createJobCandidacyDetailRead({
        id: "candidacy-1",
        job_posting: {
          id: "job-1",
          title: "Frontend Developer",
          company: "Acme",
          location: "Paris",
        },
        status: "applied",
        applied_on: "2026-08-01",
        notes: "Initial notes.",
      }),
    });

    mockUpdateJobCandidacy();
  });

  it("normalizes the route parameter before fetching the candidacy", () => {
    renderPage("/jobs/candidacies/%20candidacy-1%20/edit");

    expect(useJobCandidacyMock).toHaveBeenCalledWith("candidacy-1");
  });

  it("shows an error when the candidacy identifier is empty", () => {
    renderPage("/jobs/candidacies/%20%20%20/edit");

    expect(useJobCandidacyMock).toHaveBeenCalledWith("");

    expect(
      screen.getByRole("heading", {
        name: "Update Job Candidacy",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid candidacy identifier.",
    );

    expect(
      screen.getByRole("link", { name: /back to candidacies/i }),
    ).toHaveAttribute("href", JOB_CANDIDACIES_LIST_PATH);

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows the loading state", () => {
    mockCandidacyQuery({
      data: undefined,
      isLoading: true,
    });

    renderPage();

    const loadingMessage = screen.getByText("Loading candidacy...");

    expect(loadingMessage.closest("section")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(
      screen.getByRole("link", { name: /back to job candidacy/i }),
    ).toHaveAttribute("href", getJobCandidacyDetailPath("candidacy-1"));

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows the not-found state when the query has no data", () => {
    mockCandidacyQuery({
      data: undefined,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Job candidacy not found.",
    );

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows the not-found state for a 404 response", () => {
    mockCandidacyQuery({
      data: undefined,
      error: createAxiosError(404),
      isError: true,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Job candidacy not found.",
    );

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("shows a generic error for other query failures", () => {
    mockCandidacyQuery({
      data: undefined,
      error: createAxiosError(500),
      isError: true,
    });

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load job candidacy.",
    );

    expect(screen.queryByTestId("job-candidacy-form")).not.toBeInTheDocument();
  });

  it("renders the job posting summary and candidacy form", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Frontend Developer" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /back to job candidacy/i }),
    ).toHaveAttribute("href", getJobCandidacyDetailPath("candidacy-1"));

    expect(screen.getByTestId("job-candidacy-form")).toBeInTheDocument();

    expect(getFormProps()).toEqual(
      expect.objectContaining({
        initialValues: {
          status: "applied",
          applied_on: "2026-08-01",
          notes: "Initial notes.",
        },
        isSubmitting: false,
        error: undefined,
        submitLabel: "Update job candidacy",
        submittingLabel: "Updating...",
        onSubmit: expect.any(Function),
      }),
    );
  });

  it("passes the pending mutation state to the form", () => {
    mockUpdateJobCandidacy({
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
    const error = new Error("Could not update job candidacy.");

    mockUpdateJobCandidacy({
      error,
      isError: true,
      isPending: false,
      status: "error",
    });

    renderPage();

    expect(getFormProps()).toEqual(
      expect.objectContaining({
        isSubmitting: false,
        error: "Could not update job candidacy.",
      }),
    );
  });

  it("updates the candidacy and navigates to its detail page", () => {
    renderPage();

    getFormProps().onSubmit({
      status: "applied",
      applied_on: "2026-08-05",
      notes: "  Follow up next week.  ",
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        candidacyId: "candidacy-1",
        payload: {
          status: "applied",
          applied_on: "2026-08-05",
          notes: "Follow up next week.",
        },
      },
      {
        onSuccess: expect.any(Function),
      },
    );

    expect(mocks.navigate).not.toHaveBeenCalled();

    const updatedCandidacy = createJobCandidacyDetailRead({
      id: "candidacy-42",
    });

    const mutationOptions = mocks.mutate.mock.calls[0]?.[1] as
      | {
          onSuccess: (candidacy: typeof updatedCandidacy) => void;
        }
      | undefined;

    expect(mutationOptions).toBeDefined();

    mutationOptions?.onSuccess(updatedCandidacy);

    expect(mocks.navigate).toHaveBeenCalledWith(
      getJobCandidacyDetailPath("candidacy-42"),
      { replace: true },
    );
  });
});
