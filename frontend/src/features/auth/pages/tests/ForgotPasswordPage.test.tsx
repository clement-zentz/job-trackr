// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/tests/ForgotPasswordPage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { requestPasswordReset } from "../../api/authApi";
import { ForgotPasswordPage } from "../ForgotPasswordPage";

vi.mock("../../api/authApi", () => ({
  requestPasswordReset: vi.fn(),
}));

const EMAIL = "user@example.com";

function renderForgotPasswordPage() {
  const queryClient = createTestQueryClient();

  render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>,
    {
      wrapper: createWrapperWithClient(queryClient),
    },
  );
}

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  it("renders the forgot password page", () => {
    renderForgotPasswordPage();

    expect(
      screen.getByRole("heading", {
        name: "Forgot your password?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Enter your email address and we'll send you a password reset link.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Send reset link",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Back to login",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("requests a password reset for the submitted email", async () => {
    const user = userEvent.setup();

    vi.mocked(requestPasswordReset).mockImplementation(
      () =>
        new Promise<void>(() => {
          // Keep the mutation pending.
        }),
    );

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), EMAIL);

    await user.click(
      screen.getByRole("button", {
        name: "Send reset link",
      }),
    );

    expect(requestPasswordReset).toHaveBeenCalledWith(EMAIL);
    expect(requestPasswordReset).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Sending reset link...",
      }),
    ).toBeDisabled();

    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("shows a status message after requesting a password reset", async () => {
    const user = userEvent.setup();

    vi.mocked(requestPasswordReset).mockResolvedValue(undefined);

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), EMAIL);

    await user.click(
      screen.getByRole("button", {
        name: "Send reset link",
      }),
    );

    expect(
      await screen.findByText(
        "If an account exists for that email address, a password reset link has been sent.",
      ),
    ).toBeInTheDocument();

    expect(requestPasswordReset).toHaveBeenCalledWith(EMAIL);
    expect(requestPasswordReset).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when requesting a password reset fails", async () => {
    const user = userEvent.setup();

    vi.mocked(requestPasswordReset).mockRejectedValue(
      new Error("Password reset request failed"),
    );

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), EMAIL);

    await user.click(
      screen.getByRole("button", {
        name: "Send reset link",
      }),
    );

    expect(
      await screen.findByText(
        "We could not send the password reset link. Please try again.",
      ),
    ).toBeInTheDocument();

    expect(requestPasswordReset).toHaveBeenCalledWith(EMAIL);
    expect(requestPasswordReset).toHaveBeenCalledTimes(1);
  });
});
