// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/tests/LoginForm.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createLoginPayload } from "@/tests/factories/auth";

import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
  it("renders the login fields and submit button", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("submits the entered credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const payload = createLoginPayload();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), payload.username);
    await user.type(screen.getByLabelText("Password"), payload.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(payload);
  });

  it("renders status and error messages", () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        statusMessage="Email verification required."
        errorMessage="Invalid username or password."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Email verification required.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid username or password.",
    );
  });

  it("disables the form controls while pending", () => {
    const { container } = render(<LoginForm onSubmit={vi.fn()} isPending />);

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
    expect(container.querySelector("form")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("configures autocomplete for login credentials", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Username")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });
});
