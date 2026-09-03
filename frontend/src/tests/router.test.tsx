// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/router.test.tsx

import { act, cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentSession,
  login,
  verifyEmail,
} from "@/features/auth/api/authApi";
import { authKeys } from "@/features/auth/keys";
import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import { router } from "@/router";
import { renderWithQueryClient } from "@/tests/utils";

import {
  createAuthenticatedAuthResponse,
  createLoginPayload,
  createUnauthenticatedAuthResponse,
} from "./factories/auth";

vi.mock("@/features/auth/api/authApi", () => ({
  getCurrentSession: vi.fn(),
  login: vi.fn(),
  verifyEmail: vi.fn(),
}));

const mockedGetCurrentSession = vi.mocked(getCurrentSession);
const mockedLogin = vi.mocked(login);
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
    mockedLogin.mockReset();
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

  it("returns the user to the protected route after successful login", async () => {
    const loginPayload = createLoginPayload();
    const authenticatedAuthResponse = createAuthenticatedAuthResponse();
    const unauthenticatedAuthResponse = createUnauthenticatedAuthResponse();

    let isAuthenticated = false;

    mockedGetCurrentSession.mockImplementation(() =>
      Promise.resolve(
        isAuthenticated
          ? authenticatedAuthResponse
          : unauthenticatedAuthResponse,
      ),
    );

    mockedLogin.mockImplementation(async () => {
      isAuthenticated = true;

      return authenticatedAuthResponse;
    });

    await renderRouterAt("/settings");

    expect(
      await screen.findByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/login");

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Username"), loginPayload.username);
    await user.type(screen.getByLabelText("Password"), loginPayload.password);

    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    const main = await screen.findByRole("main");

    expect(within(main).getByText("Settings")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/settings");

    expect(mockedLogin).toHaveBeenCalledWith(loginPayload);
    expect(mockedLogin).toHaveBeenCalledTimes(1);
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

  it("renders the invalid verification link state when the key is missing", async () => {
    await renderRouterAt("/verify-email");

    expect(
      await screen.findByRole("heading", {
        name: "Invalid verification link",
      }),
    ).toBeInTheDocument();
  });

  it("renders the invalid password reset link state when the key is missing", async () => {
    await renderRouterAt("/reset-password");

    expect(
      await screen.findByRole("heading", {
        name: "Invalid password reset link",
      }),
    ).toBeInTheDocument();
  });

  it("clears non-auth queries when the authenticated session expires", async () => {
    const jobPostingsKey = jobPostingsKeys.list({
      page: 1,
      page_size: 10,
    });
    const cachedJobPostings = ["cached job posting"];

    mockedGetCurrentSession.mockResolvedValue(
      createAuthenticatedAuthResponse(),
    );

    const { queryClient } = await renderRouterAt("/settings");

    expect(
      await screen.findByRole("link", {
        name: "Settings",
        current: "page",
      }),
    ).toBeInTheDocument();

    queryClient.setQueryData(jobPostingsKey, cachedJobPostings);

    expect(queryClient.getQueryData(jobPostingsKey)).toEqual(cachedJobPostings);

    mockedGetCurrentSession.mockResolvedValue(
      createUnauthenticatedAuthResponse(),
    );

    await act(async () => {
      await queryClient.refetchQueries({
        queryKey: authKeys.session(),
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/login");

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
    expect(queryClient.getQueryData(jobPostingsKey)).toBeUndefined();
  });
});
