// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/form/JobCandidacyForm.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { JobCandidacyFormValues } from "../../../types";
import {
  JobCandidacyForm,
  type JobCandidacyFormProps,
} from "../../form/JobCandidacyForm";
import { createEmptyJobCandidacyFormValues } from "../../form/jobCandidacyFormMappers";

function renderJobCandidacyForm({
  initialValues = createEmptyJobCandidacyFormValues(),
  submitLabel = "Create candidacy",
  submittingLabel = "Creating...",
  onSubmit = vi.fn(),
  ...props
}: Partial<JobCandidacyFormProps> = {}) {
  render(
    <JobCandidacyForm
      initialValues={initialValues}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      onSubmit={onSubmit}
      {...props}
    />,
  );

  return { onSubmit };
}

describe("JobCandidacyForm", () => {
  it("renders the job candidacy form", () => {
    renderJobCandidacyForm();

    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Applied on")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create candidacy" }),
    ).toBeInTheDocument();
  });

  it("renders the provided initial values", () => {
    const initialValues: JobCandidacyFormValues = {
      status: "offer",
      applied_on: "2026-08-01",
      notes: "Received an offer.",
    };

    renderJobCandidacyForm({
      initialValues,
      submitLabel: "Save changes",
      submittingLabel: "Saving...",
    });

    expect(screen.getByLabelText("Status")).toHaveValue("offer");
    expect(screen.getByLabelText("Applied on")).toHaveValue("2026-08-01");
    expect(screen.getByLabelText("Notes")).toHaveValue("Received an offer.");
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("submits the updated form values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: JobCandidacyFormValues) => void>();

    renderJobCandidacyForm({
      initialValues: {
        status: "applied",
        applied_on: "2026-08-01",
        notes: "",
      },
      onSubmit,
    });

    await user.selectOptions(screen.getByLabelText("Status"), "interview");

    const appliedOnInput = screen.getByLabelText("Applied on");
    await user.clear(appliedOnInput);
    await user.type(appliedOnInput, "2026-08-04");

    await user.type(
      screen.getByLabelText("Notes"),
      "Technical interview scheduled.",
    );

    await user.click(screen.getByRole("button", { name: "Create candidacy" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      status: "interview",
      applied_on: "2026-08-04",
      notes: "Technical interview scheduled.",
    });
  });

  it("does not replace the status with the empty placeholder value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: JobCandidacyFormValues) => void>();

    renderJobCandidacyForm({
      initialValues: {
        status: "interview",
        applied_on: "2026-08-01",
        notes: "",
      },
      onSubmit,
    });

    await user.selectOptions(screen.getByLabelText("Status"), "");

    expect(screen.getByLabelText("Status")).toHaveValue("interview");

    await user.click(screen.getByRole("button", { name: "Create candidacy" }));

    expect(onSubmit).toHaveBeenCalledWith({
      status: "interview",
      applied_on: "2026-08-01",
      notes: "",
    });
  });

  it("displays an error message", () => {
    renderJobCandidacyForm({
      error: "Could not save job candidacy.",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save job candidacy.",
    );
  });

  it("disables the submit button and uses the submitting label", () => {
    renderJobCandidacyForm({
      isSubmitting: true,
      submitLabel: "Save changes",
      submittingLabel: "Saving...",
    });

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("does not submit while already submitting", () => {
    const { onSubmit } = renderJobCandidacyForm({
      isSubmitting: true,
    });

    const submitButton = screen.getByRole("button", {
      name: "Creating...",
    });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
