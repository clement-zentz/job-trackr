// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/tests/EmailChangeForm.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmailChangeForm } from "../EmailChangeForm";

const currentEmail = "current@example.com";

describe("EmailChangeForm", () => {
  it("renders the current email and new email field", () => {
    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={vi.fn()} />);

    expect(screen.getByText(currentEmail)).toBeInTheDocument();

    const emailInput = screen.getByLabelText("New email");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(emailInput).toBeRequired();

    expect(screen.getByRole("button", { name: "Change email" })).toBeDisabled();
  });

  it("shows a fallback when the current email is missing", () => {
    render(<EmailChangeForm currentEmail="" onSubmit={vi.fn()} />);

    expect(screen.getByText("Not provided")).toBeInTheDocument();
  });

  it("enables submission when a different email is entered", async () => {
    const user = userEvent.setup();

    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={vi.fn()} />);

    const submitButton = screen.getByRole("button", {
      name: "Change email",
    });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("New email"), "new@example.com");

    expect(submitButton).toBeEnabled();
  });

  it("prevents submission when the new email matches the current email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={onSubmit} />);

    const emailInput = screen.getByLabelText("New email");

    await user.type(screen.getByLabelText("New email"), currentEmail);

    expect(screen.getByRole("button", { name: "Change email" })).toBeDisabled();

    fireEvent.submit(emailInput.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("prevents submission when the email is blank or whitespace-only", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={onSubmit} />);

    const emailInput = screen.getByLabelText("New email");
    const submitButton = screen.getByRole("button", {
      name: "Change email",
    });

    expect(submitButton).toBeDisabled();

    await user.type(emailInput, "   ");

    expect(submitButton).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the normalized new email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New email"), "  new@example.com  ");

    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("new@example.com");
  });

  it("prevents submission of an invalid email address", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EmailChangeForm currentEmail={currentEmail} onSubmit={onSubmit} />);

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "invalid-email");

    expect(emailInput).toBeInvalid();

    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders error and status messages", () => {
    render(
      <EmailChangeForm
        currentEmail={currentEmail}
        onSubmit={vi.fn()}
        error="Unable to change email."
        status="Verification email sent."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to change email.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Verification email sent.",
    );
  });

  it("disables submission while the request is pending", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <EmailChangeForm currentEmail={currentEmail} onSubmit={onSubmit} />,
    );

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "new@example.com");

    rerender(
      <EmailChangeForm
        currentEmail={currentEmail}
        onSubmit={onSubmit}
        isSubmitting
      />,
    );

    expect(emailInput).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Sending verification...",
      }),
    ).toBeDisabled();

    const form = emailInput.closest("form");

    expect(form).toHaveAttribute("aria-busy", "true");

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
