// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/tests/SignupPage.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { signup } from "../../api/authApi";
import { SignupPage } from "../SignupPage";

vi.mock("../../api/authApi", () => ({
  signup: vi.fn(),
}));

const USERNAME = "testuser";
const EMAIL = "user@example.com";
const PASSWORD = "password-123";

function renderSignupPage() {
  const queryClient = createTestQueryClient();

  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
    {
      wrapper: createWrapperWithClient(queryClient),
    },
  );
}

async function fillSignupForm() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Username"), USERNAME);
  await user.type(screen.getByLabelText("Email"), EMAIL);
  await user.type(screen.getByLabelText("Password"), PASSWORD);
  await user.type(screen.getByLabelText("Confirm password"), PASSWORD);

  return user;
}

describe("SignupPage", () => {
  beforeEach(() => {
    vi.mocked(signup).mockReset();
  });

  it("renders the signup page", () => {
    renderSignupPage();

    expect(
      screen.getByRole("heading", {
        name: "Create your account",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Enter your details to get started."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create account",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Already have an account?")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Log in",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("creates an account with the submitted details", async () => {
    vi.mocked(signup).mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof signup>>>(() => {
          // Keep the mutation pending.
        }),
    );

    renderSignupPage();

    const user = await fillSignupForm();

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(signup).toHaveBeenCalledWith({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    });

    expect(signup).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Creating account...",
      }),
    ).toBeDisabled();

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm password")).toBeDisabled();
  });

  it("shows a dashboard link after signup when the user is authenticated", async () => {
    vi.mocked(signup).mockResolvedValue(createAuthenticatedAuthResponse());

    renderSignupPage();

    const user = await fillSignupForm();

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Account created",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your account has been successfully created."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to dashboard",
      }),
    ).toHaveAttribute("href", "/");

    expect(signup).toHaveBeenCalledWith({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    });

    expect(signup).toHaveBeenCalledTimes(1);
  });

  it("asks the user to verify their email after signup when unauthenticated", async () => {
    vi.mocked(signup).mockResolvedValue(createUnauthenticatedAuthResponse());

    renderSignupPage();

    const user = await fillSignupForm();

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Account created",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Your account has been created. Please check your email to verify your address.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to login",
      }),
    ).toHaveAttribute("href", "/login");

    expect(signup).toHaveBeenCalledWith({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    });

    expect(signup).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when signup fails", async () => {
    vi.mocked(signup).mockRejectedValue(new Error("Signup failed"));

    renderSignupPage();

    const user = await fillSignupForm();

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByText(
        "We could not create your account. Please check your details and try again.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Create your account",
      }),
    ).toBeInTheDocument();

    expect(signup).toHaveBeenCalledWith({
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    });

    expect(signup).toHaveBeenCalledTimes(1);
  });
});
