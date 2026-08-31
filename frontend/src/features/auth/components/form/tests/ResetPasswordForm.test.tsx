// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/tests/ResetPasswordForm.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createResetPasswordPayload } from "@/tests/factories/auth";

import { ResetPasswordForm } from "../ResetPasswordForm";

describe("ResetPasswordForm", () => {
  it("renders the password fields and submit button", () => {
    render(<ResetPasswordForm resetKey="reset-key" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset password" }),
    ).toBeInTheDocument();
  });

  it("submits the reset key and password when passwords match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const payload = createResetPasswordPayload();

    render(<ResetPasswordForm resetKey={payload.key} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New password"), payload.password);
    await user.type(
      screen.getByLabelText("Confirm new password"),
      payload.password,
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(payload);
  });

  it("does not submit when passwords do not match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResetPasswordForm resetKey="reset-key" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New password"), "new-password");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "different-password",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );
  });

  it("clears the validation error after submitting matching passwords", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResetPasswordForm resetKey="reset-key" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New password"), "new-password");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "different-password",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );

    await user.clear(screen.getByLabelText("Confirm new password"));
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "new-password",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(onSubmit).toHaveBeenCalledWith({
      key: "reset-key",
      password: "new-password",
    });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders status and error messages", () => {
    render(
      <ResetPasswordForm
        resetKey="reset-key"
        onSubmit={vi.fn()}
        statusMessage="Choose a new password."
        errorMessage="Unable to reset password."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Choose a new password.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to reset password.",
    );
  });

  it("disables the form controls while pending", () => {
    const { container } = render(
      <ResetPasswordForm resetKey="reset-key" onSubmit={vi.fn()} isPending />,
    );

    expect(screen.getByLabelText("New password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm new password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Resetting password..." }),
    ).toBeDisabled();
    expect(container.querySelector("form")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("configures autocomplete for new passwords", () => {
    render(<ResetPasswordForm resetKey="reset-key" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByLabelText("Confirm new password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });
});
