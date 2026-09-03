// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/tests/LoginPage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUnauthenticatedAuthResponse } from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { login } from "../../api/authApi";
import { LoginPage } from "../LoginPage";

vi.mock("../../api/authApi", () => ({
  login: vi.fn(),
}));

const USERNAME = "testuser";
const PASSWORD = "password-123";

function renderLoginPage() {
  const queryClient = createTestQueryClient();

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
    {
      wrapper: createWrapperWithClient(queryClient),
    },
  );
}

async function fillLoginForm() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Username"), USERNAME);
  await user.type(screen.getByLabelText("Password"), PASSWORD);

  return user;
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
  });

  it("renders the login page", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Enter your credentials to access your account."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Forgot your password?",
      }),
    ).toHaveAttribute("href", "/forgot-password");

    expect(
      screen.getByRole("link", {
        name: "Create an account",
      }),
    ).toHaveAttribute("href", "/register");
  });

  it("logs in with the submitted credentials", async () => {
    vi.mocked(login).mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof login>>>(() => {
          // Keep the mutation pending.
        }),
    );

    renderLoginPage();

    const user = await fillLoginForm();

    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(login).toHaveBeenCalledWith({
      username: USERNAME,
      password: PASSWORD,
    });

    expect(login).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Signing in...",
      }),
    ).toBeDisabled();

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
  });

  it("shows a verification message when login requires an additional authentication step", async () => {
    vi.mocked(login).mockResolvedValue(createUnauthenticatedAuthResponse());

    renderLoginPage();

    const user = await fillLoginForm();

    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(
      await screen.findByText(
        "Additional verification is required before you can sign in. Please check your email.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();

    expect(login).toHaveBeenCalledWith({
      username: USERNAME,
      password: PASSWORD,
    });

    expect(login).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when login fails", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Login failed"));

    renderLoginPage();

    const user = await fillLoginForm();

    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(
      await screen.findByText(
        "We could not sign you in. Please check your credentials and try again.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();

    expect(login).toHaveBeenCalledWith({
      username: USERNAME,
      password: PASSWORD,
    });

    expect(login).toHaveBeenCalledTimes(1);
  });
});
