// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useVerifyEmail.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createAuthUser,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { verifyEmail } from "../../api/authApi";
import { authKeys } from "../../keys";
import { useVerifyEmail } from "../useVerifyEmail";

vi.mock("../../api/authApi", () => ({
  verifyEmail: vi.fn(),
}));

const mockedVerifyEmail = vi.mocked(verifyEmail);

describe("useVerifyEmail", () => {
  beforeEach(() => {
    mockedVerifyEmail.mockReset();
  });

  it("calls verifyEmail with the verification key", async () => {
    const queryClient = createTestQueryClient();
    const key = "email-verification-key";
    const response = createAuthenticatedAuthResponse();

    mockedVerifyEmail.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(key);

    expect(resultData).toEqual(response);
    expect(mockedVerifyEmail).toHaveBeenCalledOnce();
    expect(mockedVerifyEmail).toHaveBeenCalledWith(key);
  });

  it("stores the authenticated user in the session query cache", async () => {
    const queryClient = createTestQueryClient();
    const response = createAuthenticatedAuthResponse();

    mockedVerifyEmail.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync("email-verification-key");

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });

  it("stores null in the session query cache when verification is unauthenticated", async () => {
    const queryClient = createTestQueryClient();
    const response = createUnauthenticatedAuthResponse();

    mockedVerifyEmail.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync("email-verification-key");

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("stores null when an authenticated response has no user", async () => {
    const queryClient = createTestQueryClient();
    const response = createAuthenticatedAuthResponse({
      data: {
        user: undefined,
      },
    });

    mockedVerifyEmail.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync("email-verification-key");

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("preserves the session query cache when email verification fails", async () => {
    const queryClient = createTestQueryClient();
    const existingUser = createAuthUser();

    queryClient.setQueryData(authKeys.session(), existingUser);

    mockedVerifyEmail.mockRejectedValueOnce(
      new Error("Email verification failed"),
    );

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(
      result.current.mutateAsync("email-verification-key"),
    ).rejects.toThrow("Email verification failed");

    expect(queryClient.getQueryData(authKeys.session())).toEqual(existingUser);
  });

  it("prevents an in-flight session query from overwriting the authenticated user", async () => {
    const queryClient = createTestQueryClient();
    const response = createAuthenticatedAuthResponse();
    const deferredSession = createDeferred<null>();

    const sessionQueryPromise = queryClient
      .fetchQuery({
        queryKey: authKeys.session(),
        queryFn: () => deferredSession.promise,
      })
      .catch(() => undefined);

    expect(
      queryClient.isFetching({
        queryKey: authKeys.session(),
      }),
    ).toBe(1);

    mockedVerifyEmail.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync("email-verification-key");

    deferredSession.resolve(null);
    await sessionQueryPromise;

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });
});
