// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/tests/ForgotPasswordForm.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "../ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  it("renders the email field and submit button", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send reset link" }),
    ).toBeInTheDocument();
  });

  it("submits the entered email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("user@example.com");
  });

  it("renders status and error messages", () => {
    render(
      <ForgotPasswordForm
        onSubmit={vi.fn()}
        statusMessage="Password reset email sent."
        errorMessage="Unable to request a password reset."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Password reset email sent.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to request a password reset.",
    );
  });

  it("disables the form controls while pending", () => {
    const { container } = render(
      <ForgotPasswordForm onSubmit={vi.fn()} isPending />,
    );

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Sending reset link..." }),
    ).toBeDisabled();
    expect(container.querySelector("form")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("configures autocomplete for the email field", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
  });
});
