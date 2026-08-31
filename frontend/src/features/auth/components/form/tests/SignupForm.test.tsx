// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/tests/SignupForm.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createSignupPayload } from "@/tests/factories/auth";

import { SignupForm } from "../SignupForm";

describe("SignupForm", () => {
  it("renders the signup fields and submit button", () => {
    render(<SignupForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("submits the signup payload when passwords match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const payload = createSignupPayload();

    render(<SignupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), payload.username);
    await user.type(screen.getByLabelText("Email"), payload.email);
    await user.type(screen.getByLabelText("Password"), payload.password);
    await user.type(
      screen.getByLabelText("Confirm password"),
      payload.password,
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(payload);
  });

  it("does not submit when passwords do not match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SignupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "test-user");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "new-password");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "different-password",
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );
  });

  it("clears the validation error after submitting matching passwords", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SignupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "test-user");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "new-password");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "different-password",
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );

    await user.clear(screen.getByLabelText("Confirm password"));
    await user.type(screen.getByLabelText("Confirm password"), "new-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      username: "test-user",
      email: "user@example.com",
      password: "new-password",
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders status and error messages", () => {
    render(
      <SignupForm
        onSubmit={vi.fn()}
        statusMessage="Check your email to verify your account."
        errorMessage="Unable to create account."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Check your email to verify your account.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to create account.",
    );
  });

  it("disables the form controls while pending", () => {
    const { container } = render(<SignupForm onSubmit={vi.fn()} isPending />);

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Creating account..." }),
    ).toBeDisabled();
    expect(container.querySelector("form")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("configures autocomplete for signup fields", () => {
    render(<SignupForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Username")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });
});
