// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/tests/ResetPasswordPage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { resetPassword } from "../../api/authApi";
import { ResetPasswordPage } from "../ResetPasswordPage";

vi.mock("../../api/authApi", () => ({
  resetPassword: vi.fn(),
}));

const RESET_KEY = "reset-key";
const NEW_PASSWORD = "new-password-123";

function renderResetPasswordPage(
  initialEntry = `/reset-password/${RESET_KEY}`,
) {
  const queryClient = createTestQueryClient();

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:key" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>,
    {
      wrapper: createWrapperWithClient(queryClient),
    },
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.mocked(resetPassword).mockReset();
  });

  it("shows an invalid link message when the reset key is missing", () => {
    renderResetPasswordPage("/reset-password");

    expect(
      screen.getByRole("heading", {
        name: "Invalid password reset link",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("The password reset link is missing its reset key."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please request a new password reset link."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Request a new reset link",
      }),
    ).toHaveAttribute("href", "/forgot-password");

    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("resets the password using the key from the route", async () => {
    const user = userEvent.setup();

    vi.mocked(resetPassword).mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof resetPassword>>>(() => {
          // Keep the mutation pending.
        }),
    );

    renderResetPasswordPage();

    await user.type(screen.getByLabelText("New password"), NEW_PASSWORD);

    await user.type(
      screen.getByLabelText("Confirm new password"),
      NEW_PASSWORD,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reset password",
      }),
    );

    expect(resetPassword).toHaveBeenCalledWith({
      key: RESET_KEY,
      password: NEW_PASSWORD,
    });

    expect(resetPassword).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Resetting password...",
      }),
    ).toBeDisabled();
  });

  it("shows a dashboard link after resetting the password when the user is authenticated", async () => {
    const user = userEvent.setup();

    vi.mocked(resetPassword).mockResolvedValue(
      createAuthenticatedAuthResponse(),
    );

    renderResetPasswordPage();

    await user.type(screen.getByLabelText("New password"), NEW_PASSWORD);

    await user.type(
      screen.getByLabelText("Confirm new password"),
      NEW_PASSWORD,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reset password",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Password reset",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your password has been successfully reset."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to dashboard",
      }),
    ).toHaveAttribute("href", "/");

    expect(resetPassword).toHaveBeenCalledWith({
      key: RESET_KEY,
      password: NEW_PASSWORD,
    });

    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows a login link after resetting the password when the user is unauthenticated", async () => {
    const user = userEvent.setup();

    vi.mocked(resetPassword).mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    renderResetPasswordPage();

    await user.type(screen.getByLabelText("New password"), NEW_PASSWORD);

    await user.type(
      screen.getByLabelText("Confirm new password"),
      NEW_PASSWORD,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reset password",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Password reset",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to login",
      }),
    ).toHaveAttribute("href", "/login");

    expect(resetPassword).toHaveBeenCalledWith({
      key: RESET_KEY,
      password: NEW_PASSWORD,
    });

    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when resetting the password fails", async () => {
    const user = userEvent.setup();

    vi.mocked(resetPassword).mockRejectedValue(
      new Error("Password reset failed"),
    );

    renderResetPasswordPage();

    await user.type(screen.getByLabelText("New password"), NEW_PASSWORD);

    await user.type(
      screen.getByLabelText("Confirm new password"),
      NEW_PASSWORD,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reset password",
      }),
    );

    expect(
      await screen.findByText(
        "We could not reset your password. The reset link may be invalid or expired.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Reset your password",
      }),
    ).toBeInTheDocument();

    expect(resetPassword).toHaveBeenCalledWith({
      key: RESET_KEY,
      password: NEW_PASSWORD,
    });

    expect(resetPassword).toHaveBeenCalledTimes(1);
  });
});
