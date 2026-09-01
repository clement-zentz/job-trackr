// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/tests/VerifyEmailPage.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { verifyEmail } from "../../api/authApi";
import { VerifyEmailPage } from "../VerifyEmailPage";

vi.mock("../../api/authApi", () => ({
  verifyEmail: vi.fn(),
}));

const VERIFICATION_KEY = "verification-key";

function renderVerifyEmailPage(
  initialEntry = `/verify-email/${VERIFICATION_KEY}`,
) {
  const queryClient = createTestQueryClient();

  render(
    <StrictMode>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:key" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
    {
      wrapper: createWrapperWithClient(queryClient),
    },
  );
}

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.mocked(verifyEmail).mockReset();
  });

  it("shows an invalid link message when the verification key is missing", () => {
    renderVerifyEmailPage("/verify-email");

    expect(
      screen.getByRole("heading", {
        name: "Invalid verification link",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The email verification link is missing its verification key.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please use the verification link from your email."),
    ).toBeInTheDocument();

    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it("verifies the email using the key from the route", async () => {
    vi.mocked(verifyEmail).mockImplementation(
      () =>
        new Promise<Awaited<ReturnType<typeof verifyEmail>>>(() => {
          // Keep the mutation pending.
        }),
    );

    renderVerifyEmailPage();

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith(VERIFICATION_KEY);
    });

    expect(verifyEmail).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("heading", {
        name: "Verifying your email",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Verifying email...")).toBeInTheDocument();
  });

  it("completes verification under StrictMode without getting stuck in the pending state", async () => {
    vi.mocked(verifyEmail).mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    renderVerifyEmailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Email verified",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Verifying your email",
      }),
    ).not.toBeInTheDocument();

    expect(verifyEmail).toHaveBeenCalledWith(VERIFICATION_KEY);
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("shows a dashboard link after verification when the user is authenticated", async () => {
    vi.mocked(verifyEmail).mockResolvedValue(createAuthenticatedAuthResponse());

    renderVerifyEmailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Email verified",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your email address has been successfully verified."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to dashboard",
      }),
    ).toHaveAttribute("href", "/");

    expect(verifyEmail).toHaveBeenCalledWith(VERIFICATION_KEY);
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("shows a login link after verification when the user is unauthenticated", async () => {
    vi.mocked(verifyEmail).mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    renderVerifyEmailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Email verified",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Continue to login",
      }),
    ).toHaveAttribute("href", "/login");

    expect(verifyEmail).toHaveBeenCalledWith(VERIFICATION_KEY);
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when email verification fails", async () => {
    vi.mocked(verifyEmail).mockRejectedValue(
      new Error("Email verification failed"),
    );

    renderVerifyEmailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Email verification failed",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("We could not verify your email address."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("The verification link may be invalid or expired."),
    ).toBeInTheDocument();

    expect(verifyEmail).toHaveBeenCalledWith(VERIFICATION_KEY);
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });
});
