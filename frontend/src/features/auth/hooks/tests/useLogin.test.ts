// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useLogin.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createAuthUser,
  createLoginPayload,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { login } from "../../api/authApi";
import { authKeys } from "../../keys";
import { useLogin } from "../useLogin";

vi.mock("../../api/authApi", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

describe("useLogin", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it("calls login with the login payload", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
    const response = createAuthenticatedAuthResponse();

    mockedLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(payload);

    expect(resultData).toEqual(response);
    expect(mockedLogin).toHaveBeenCalledOnce();
    expect(mockedLogin).toHaveBeenCalledWith(payload);
  });

  it("stores the authenticated user in the session query cache", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
    const response = createAuthenticatedAuthResponse();

    mockedLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });

  it("stores null in the session query cache when login is unauthenticated", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
    const response = createUnauthenticatedAuthResponse();

    mockedLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("stores null when an authenticated response has no user", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
    const response = createAuthenticatedAuthResponse({
      data: {
        user: undefined,
      },
    });

    mockedLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("preserves the session query cache when login fails", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
    const existingUser = createAuthUser();

    queryClient.setQueryData(authKeys.session(), existingUser);

    mockedLogin.mockRejectedValueOnce(new Error("Login failed"));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(result.current.mutateAsync(payload)).rejects.toThrow(
      "Login failed",
    );

    expect(queryClient.getQueryData(authKeys.session())).toEqual(existingUser);
  });

  it("prevents an in-flight session query from overwriting the authenticated user", async () => {
    const queryClient = createTestQueryClient();
    const payload = createLoginPayload();
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

    mockedLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    deferredSession.resolve(null);
    await sessionQueryPromise;

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });
});
