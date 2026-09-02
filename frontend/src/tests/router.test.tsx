// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/router.test.tsx

import { act, cleanup, screen } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentSession, verifyEmail } from "@/features/auth/api/authApi";
import { router } from "@/router";
import { renderWithQueryClient } from "@/tests/utils";

import {
  createAuthenticatedAuthResponse,
  createUnauthenticatedAuthResponse,
} from "./factories/auth";

vi.mock("@/features/auth/api/authApi", () => ({
  getCurrentSession: vi.fn(),
  verifyEmail: vi.fn(),
}));

const mockedGetCurrentSession = vi.mocked(getCurrentSession);
const mockedVerifyEmail = vi.mocked(verifyEmail);

async function renderRouterAt(path: string) {
  await act(async () => {
    await router.navigate(path);
  });

  return renderWithQueryClient(<RouterProvider router={router} />);
}

describe("router", () => {
  beforeEach(() => {
    mockedGetCurrentSession.mockReset();
    mockedVerifyEmail.mockReset();

    mockedGetCurrentSession.mockResolvedValue(
      createAuthenticatedAuthResponse(),
    );
  });

  afterEach(async () => {
    cleanup();

    await act(async () => {
      await router.navigate("/");
    });
  });

  it("shows a loading state while the session is being resolved", async () => {
    mockedGetCurrentSession.mockImplementation(
      () => new Promise(() => undefined),
    );

    await renderRouterAt("/");

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  it.each([
    ["/login", "Sign in"],
    ["/register", "Create your account"],
    ["/forgot-password", "Forgot your password?"],
  ])("allows unauthenticated users to access %s", async (path, heading) => {
    mockedGetCurrentSession.mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    await renderRouterAt(path);

    expect(
      await screen.findByRole("heading", {
        name: heading,
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(path);
  });

  it.each(["/login", "/register", "/forgot-password"])(
    "redirects authenticated users away from %s",
    async (path) => {
      await renderRouterAt(path);

      expect(
        await screen.findByRole("link", {
          name: "Dashboard",
          current: "page",
        }),
      ).toBeInTheDocument();

      expect(router.state.location.pathname).toBe("/");
    },
  );

  it("allows unauthenticated users to access the email verification route", async () => {
    mockedGetCurrentSession.mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );
    mockedVerifyEmail.mockImplementation(() => new Promise(() => undefined));

    await renderRouterAt("/verify-email/verification-key");

    expect(
      await screen.findByRole("heading", {
        name: "Verifying your email",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe(
      "/verify-email/verification-key",
    );
  });

  it("allows unauthenticated users to access the password reset route", async () => {
    mockedGetCurrentSession.mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    await renderRouterAt("/reset-password/reset-key");

    expect(
      await screen.findByRole("heading", {
        name: "Reset your password",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/reset-password/reset-key");
  });

  it("redirects unauthenticated users from protected routes to login", async () => {
    mockedGetCurrentSession.mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    await renderRouterAt("/settings");

    expect(
      await screen.findByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/login");
  });

  it("registers the job candidacies routes", async () => {
    await renderRouterAt("/jobs/candidacies");

    expect(
      await screen.findByRole("heading", {
        name: "Job Candidacies",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/jobs/candidacies");
  });
});
