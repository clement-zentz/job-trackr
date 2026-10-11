// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/tests/EmailChangeForm.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { EmailChangeForm } from "../EmailChangeForm";

const currentEmail = "current@example.com";

function renderEmailChangeForm(
  props: Partial<ComponentProps<typeof EmailChangeForm>> = {},
) {
  return render(
    <EmailChangeForm
      currentEmail={currentEmail}
      onSubmit={vi.fn()}
      onResend={vi.fn()}
      {...props}
    />,
  );
}

describe("EmailChangeForm", () => {
  it("renders the current email and new email field", () => {
    renderEmailChangeForm({ onSubmit: vi.fn() });

    expect(screen.getByText(currentEmail)).toBeInTheDocument();

    const emailInput = screen.getByLabelText("New email");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(emailInput).toBeRequired();

    expect(screen.getByRole("button", { name: "Change email" })).toBeDisabled();
  });

  it("shows a fallback when the current email is missing", () => {
    renderEmailChangeForm({
      currentEmail: "",
      onSubmit: vi.fn(),
    });

    expect(screen.getByText("Not provided")).toBeInTheDocument();
  });

  it("enables submission when a different email is entered", async () => {
    const user = userEvent.setup();

    renderEmailChangeForm({ onSubmit: vi.fn() });

    const submitButton = screen.getByRole("button", {
      name: "Change email",
    });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("New email"), "new@example.com");

    expect(submitButton).toBeEnabled();
  });

  it("prevents submission and resend when the new email matches the current email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderEmailChangeForm({ onSubmit });

    const emailInput = screen.getByLabelText("New email");

    await user.type(screen.getByLabelText("New email"), currentEmail);

    expect(screen.getByRole("button", { name: "Change email" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Resend verification" }),
    ).toBeDisabled();

    fireEvent.submit(emailInput.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("prevents submission and resend when the email is blank or whitespace-only", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderEmailChangeForm({ onSubmit });

    const emailInput = screen.getByLabelText("New email");
    const submitButton = screen.getByRole("button", {
      name: "Change email",
    });
    const resendButton = screen.getByRole("button", {
      name: "Resend verification",
    });

    expect(submitButton).toBeDisabled();
    expect(resendButton).toBeDisabled();

    await user.type(emailInput, "   ");

    expect(submitButton).toBeDisabled();
    expect(resendButton).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the normalized new email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderEmailChangeForm({ onSubmit });

    await user.type(screen.getByLabelText("New email"), "  new@example.com  ");

    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("new@example.com");
  });

  it("prevents submission of an invalid email address", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderEmailChangeForm({ onSubmit });

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "invalid-email");

    expect(emailInput).toBeInvalid();

    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders error and status messages", () => {
    renderEmailChangeForm({
      onSubmit: vi.fn(),
      error: "Unable to change email.",
      status: "Verification email sent.",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to change email.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Verification email sent.",
    );
  });

  it("disables submission and resend while the request is pending", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onResend = vi.fn();

    const { rerender } = renderEmailChangeForm({ onSubmit });

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "new@example.com");

    rerender(
      <EmailChangeForm
        currentEmail={currentEmail}
        onSubmit={onSubmit}
        onResend={onResend}
        isSubmitting
      />,
    );

    expect(emailInput).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Sending verification...",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Resending verification...",
      }),
    ).toBeDisabled();

    const form = emailInput.closest("form");

    expect(form).toHaveAttribute("aria-busy", "true");

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("resends the normalized email without submitting the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onResend = vi.fn();

    renderEmailChangeForm({ onSubmit, onResend });

    await user.type(
      screen.getByLabelText("New email"),
      "  pending@example.com  ",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Resend verification",
      }),
    );

    expect(onResend).toHaveBeenCalledExactlyOnceWith("pending@example.com");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not resend verification for an invalid email", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();

    renderEmailChangeForm({ onResend });

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "invalid-email");

    expect(emailInput).toBeInvalid();

    await user.click(
      screen.getByRole("button", {
        name: "Resend verification",
      }),
    );

    expect(onResend).not.toHaveBeenCalled();
  });

  it("normalizes surrounding Unicode whitespace before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onResend = vi.fn();

    render(
      <EmailChangeForm
        currentEmail="current@example.com"
        onSubmit={onSubmit}
        onResend={onResend}
      />,
    );

    const emailInput = screen.getByRole("textbox", {
      name: "New email",
    });

    // Non-breaking spaces (U+00A0) are not stripped by native
    // email input sanitization.
    fireEvent.change(emailInput, {
      target: {
        value: "\u00A0new@example.com\u00A0",
      },
    });

    // The controlled input should immediately contain the normalized value.
    expect(emailInput).toHaveValue("new@example.com");

    await user.click(screen.getByRole("button", { name: "Change email" }));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("new@example.com");

    await user.click(
      screen.getByRole("button", { name: "Resend verification" }),
    );

    expect(onResend).toHaveBeenCalledExactlyOnceWith("new@example.com");
  });

  it("prevents submission and resend when only the email casing differs", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onResend = vi.fn();

    renderEmailChangeForm({ onSubmit, onResend });

    const emailInput = screen.getByLabelText("New email");

    await user.type(emailInput, "CURRENT@EXAMPLE.COM");

    const submitButton = screen.getByRole("button", {
      name: "Change email",
    });
    const resendButton = screen.getByRole("button", {
      name: "Resend verification",
    });

    expect(submitButton).toBeDisabled();
    expect(resendButton).toBeDisabled();

    // Verify that the submission guard also rejects direct form submission.
    fireEvent.submit(emailInput.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onResend).not.toHaveBeenCalled();
  });
});
