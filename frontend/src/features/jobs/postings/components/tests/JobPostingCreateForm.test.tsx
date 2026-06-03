// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/JobPostingCreateForm.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JobPostingCreateForm } from "../JobPostingCreateForm";

describe("JobPostingCreateForm", () => {
  it("renders the create job posting form", () => {
    render(<JobPostingCreateForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Salary")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();

    expect(
      screen.getByRole("checkbox", { name: "Easy Apply" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Active Hiring" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Platform")).toBeInTheDocument();
    expect(screen.getByLabelText("Employment Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Work Mode")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Create job posting" }),
    ).toBeInTheDocument();
  });

  it("submits required fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Frontend Developer");
    await user.type(screen.getByLabelText("Company"), "Acme");
    await user.type(screen.getByLabelText("Location"), "Paris");

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Developer",
        company: "Acme",
        location: "Paris",
      }),
    );
  });

  it("does not submit when required fields are missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits optional text fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Backend Developer");
    await user.type(screen.getByLabelText("Company"), "Django Corp");
    await user.type(screen.getByLabelText("Location"), "Remote");

    await user.type(
      screen.getByLabelText("URL"),
      "https://example.com/jobs/backend-developer",
    );
    await user.type(screen.getByLabelText("Salary"), "45k - 55k");
    await user.type(
      screen.getByLabelText("Description"),
      "Work on a Django REST Framework backend.",
    );

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Backend Developer",
        company: "Django Corp",
        location: "Remote",
        url: "https://example.com/jobs/backend-developer",
        salary: "45k - 55k",
        description: "Work on a Django REST Framework backend.",
      }),
    );
  });

  it("submits checkbox values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "React Developer");
    await user.type(screen.getByLabelText("Company"), "Frontend Ltd");
    await user.type(screen.getByLabelText("Location"), "Lyon");

    await user.click(screen.getByRole("checkbox", { name: "Easy Apply" }));
    await user.click(screen.getByRole("checkbox", { name: "Active Hiring" }));

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        easy_apply: true,
        active_hiring: true,
      }),
    );
  });

  it("submits selected choice fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Full Stack Developer");
    await user.type(screen.getByLabelText("Company"), "Tech Company");
    await user.type(screen.getByLabelText("Location"), "Paris");

    await user.selectOptions(screen.getByLabelText("Platform"), "wttj");
    await user.selectOptions(
      screen.getByLabelText("Employment Type"),
      "full_time",
    );
    await user.selectOptions(screen.getByLabelText("Work Mode"), "hybrid");

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: "wttj",
        employment_type: "full_time",
        work_mode: "hybrid",
      }),
    );
  });

  it("normalizes empty optional fields before submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<JobPostingCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Python Developer");
    await user.type(screen.getByLabelText("Company"), "Backend SAS");
    await user.type(screen.getByLabelText("Location"), "Paris");

    await user.click(
      screen.getByRole("button", { name: "Create job posting" }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const submittedPayload = onSubmit.mock.calls[0][0];

    expect(submittedPayload).toMatchObject({
      title: "Python Developer",
      company: "Backend SAS",
      location: "Paris",
      url: undefined,
      salary: undefined,
      description: undefined,
      platform: undefined,
      employment_type: undefined,
      work_mode: undefined,
      posted_at: null,
    });
  });

  it("displays an error message", () => {
    render(
      <JobPostingCreateForm
        onSubmit={vi.fn()}
        error="Could not create job posting."
      />,
    );

    expect(
      screen.getByText("Could not create job posting."),
    ).toBeInTheDocument();
  });

  it("disables the submit button while submitting", () => {
    render(<JobPostingCreateForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByRole("button", { name: "Creating..." })).toBeDisabled();
  });
});
