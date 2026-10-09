// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/router.test.tsx

import {
  act,
  cleanup,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getUserAccount } from "@/features/account/api/accountApi";
import {
  getCurrentSession,
  login,
  verifyEmail,
} from "@/features/auth/api/authApi";
import { authKeys } from "@/features/auth/keys";
import {
  createJobCandidacy,
  listJobCandidacies,
} from "@/features/jobs/candidacies/api/jobCandidaciesApi";
import { useCreateJobCandidacy } from "@/features/jobs/candidacies/hooks/useCreateJobCandidacy";
import { jobCandidaciesKeys } from "@/features/jobs/candidacies/keys";
import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import { router } from "@/router";
import {
  createDeferred,
  createWrapperWithClient,
  renderWithQueryClient,
} from "@/tests/utils";

import { createUserAccountRead } from "./factories/account";
import {
  createAuthenticatedAuthResponse,
  createAuthUser,
  createLoginPayload,
  createUnauthenticatedAuthResponse,
} from "./factories/auth";
import {
  createJobCandidacyCreatePayload,
  createJobCandidacyDetailRead,
} from "./factories/jobCandidacy";
import { createPaginatedResponse } from "./factories/paginatedResponse";

vi.mock("@/features/auth/api/authApi", () => ({
  getCurrentSession: vi.fn(),
  login: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("@/features/account/api/accountApi", () => ({
  getUserAccount: vi.fn(),
}));

vi.mock(
  import("@/features/jobs/candidacies/api/jobCandidaciesApi"),
  async (importOriginal) => ({
    ...(await importOriginal()),
    createJobCandidacy: vi.fn(),
    listJobCandidacies: vi.fn(),
  }),
);

const mockedGetCurrentSession = vi.mocked(getCurrentSession);
const mockedLogin = vi.mocked(login);
const mockedVerifyEmail = vi.mocked(verifyEmail);

const mockedGetUserAccount = vi.mocked(getUserAccount);

const mockedCreateJobCandidacy = vi.mocked(createJobCandidacy);
const mockedListJobCandidacies = vi.mocked(listJobCandidacies);

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

    mockedGetUserAccount.mockReset();

    mockedCreateJobCandidacy.mockReset();
    mockedListJobCandidacies.mockReset();

    mockedGetCurrentSession.mockResolvedValue(
      createAuthenticatedAuthResponse(),
    );

    mockedGetUserAccount.mockResolvedValue(createUserAccountRead());

    mockedListJobCandidacies.mockResolvedValue(createPaginatedResponse([]));
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

  it("redirects authenticated users from the index to job candidacies using replace", async () => {
    await renderRouterAt("/");

    expect(
      await screen.findByRole("heading", { name: "Job Candidacies" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Job Candidacies",
        current: "page",
      }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/jobs/candidacies");
    expect(router.state.historyAction).toBe("REPLACE");
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
    "redirects authenticated users from %s to job candidacies",
    async (path) => {
      await renderRouterAt(path);

      expect(
        await screen.findByRole("link", {
          name: "Job Candidacies",
          current: "page",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: "Job Candidacies" }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/jobs/candidacies");
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

  it.each(["/", "/account", "/jobs/candidacies", "/jobs/postings"])(
    "redirects unauthenticated users from %s to login",
    async (path) => {
      mockedGetCurrentSession.mockResolvedValue(
        createUnauthenticatedAuthResponse(),
      );

      await renderRouterAt(path);

      expect(
        await screen.findByRole("heading", {
          name: "Sign in",
        }),
      ).toBeInTheDocument();

      expect(router.state.location.pathname).toBe("/login");
      expect(router.state.location.state).toMatchObject({
        from: { pathname: path },
      });
    },
  );

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

    await renderRouterAt("/account");

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

    await waitFor(() => {
      const main = within(screen.getByRole("main"));

      expect(
        main.getByRole("heading", { name: "Account" }),
      ).toBeInTheDocument();
      expect(
        main.getByRole("heading", { name: "Profile" }),
      ).toBeInTheDocument();
    });

    expect(router.state.location.pathname).toBe("/account");

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

    const { queryClient } = await renderRouterAt("/account");

    expect(
      await screen.findByRole("link", {
        name: "Account",
        current: "page",
      }),
    ).toBeInTheDocument();

    queryClient.setQueryData(jobPostingsKey, cachedJobPostings);

    expect(queryClient.getQueryData(jobPostingsKey)).toEqual(cachedJobPostings);

    const candidacy = createJobCandidacyDetailRead();
    const deferred = createDeferred<typeof candidacy>();
    mockedCreateJobCandidacy.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });
    const pendingMutation = result.current.mutateAsync(
      createJobCandidacyCreatePayload(),
    );
    await waitFor(() =>
      expect(mockedCreateJobCandidacy).toHaveBeenCalledOnce(),
    );

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
    expect(mockedCreateJobCandidacy.mock.lastCall?.[1]?.aborted).toBe(true);

    await act(async () => {
      deferred.resolve(candidacy);
      await pendingMutation;
    });
    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(candidacy.id)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(jobPostingsKey)).toBeUndefined();
  });

  it("shows a retry state when the initial session request fails", async () => {
    const error = new Error("Session request failed");

    mockedGetCurrentSession.mockRejectedValueOnce(error);

    await renderRouterAt("/account");

    expect(
      await screen.findByText(
        "Unable to determine your authentication status.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Try again",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/account");

    expect(
      screen.queryByRole("heading", {
        name: "Sign in",
      }),
    ).not.toBeInTheDocument();
  });

  it("retries the session request after a bootstrap failure", async () => {
    mockedGetCurrentSession
      .mockRejectedValueOnce(new Error("Session request failed"))
      .mockResolvedValueOnce(createAuthenticatedAuthResponse());

    await renderRouterAt("/account");

    expect(
      await screen.findByText(
        "Unable to determine your authentication status.",
      ),
    ).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: "Try again",
      }),
    );

    expect(
      await screen.findByRole("link", {
        name: "Account",
        current: "page",
      }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/account");
  });

  it("clears non-auth queries when the authenticated user changes", async () => {
    const userAResponse = createAuthenticatedAuthResponse({
      data: {
        user: createAuthUser({
          id: 1,
          username: "user-a",
        }),
      },
    });
    const userBResponse = createAuthenticatedAuthResponse({
      data: {
        user: createAuthUser({
          id: 2,
          username: "user-b",
        }),
      },
    });

    const jobPostingsKey = jobPostingsKeys.list({
      page: 1,
      page_size: 10,
    });

    mockedGetCurrentSession.mockResolvedValue(userAResponse);

    const { queryClient } = await renderRouterAt("/account");

    expect(
      await screen.findByRole("link", {
        name: "Account",
        current: "page",
      }),
    ).toBeInTheDocument();

    queryClient.setQueryData(jobPostingsKey, ["user A cached job"]);

    expect(queryClient.getQueryData(jobPostingsKey)).toEqual([
      "user A cached job",
    ]);

    const candidacy = createJobCandidacyDetailRead();
    const deferred = createDeferred<typeof candidacy>();
    mockedCreateJobCandidacy.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });
    const pendingMutation = result.current.mutateAsync(
      createJobCandidacyCreatePayload(),
    );
    await waitFor(() =>
      expect(mockedCreateJobCandidacy).toHaveBeenCalledOnce(),
    );

    mockedGetCurrentSession.mockResolvedValue(userBResponse);

    await act(async () => {
      await queryClient.refetchQueries({
        queryKey: authKeys.session(),
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(jobPostingsKey)).toBeUndefined();
    });

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      userBResponse.data.user,
    );

    expect(mockedCreateJobCandidacy.mock.lastCall?.[1]?.aborted).toBe(true);
    queryClient.setQueryData(jobPostingsKey, ["user B cached job"]);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(async () => {
      deferred.resolve(candidacy);
      await pendingMutation;
    });
    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(candidacy.id)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(jobPostingsKey)).toEqual([
      "user B cached job",
    ]);
    expect(invalidate).not.toHaveBeenCalled();

    expect(router.state.location.pathname).toBe("/account");
  });

  it("registers the account route", async () => {
    mockedGetUserAccount.mockResolvedValue(
      createUserAccountRead({
        email: "john.doe@example.com",
      }),
    );

    await renderRouterAt("/account");

    expect(
      await screen.findByRole("heading", {
        name: "Account",
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("john.doe@example.com", { selector: "dd" }),
    ).toBeInTheDocument();

    expect(router.state.location.pathname).toBe("/account");
  });
});
