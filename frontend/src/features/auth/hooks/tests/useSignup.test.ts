// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useSignup.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createAuthUser,
  createSignupPayload,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { signup } from "../../api/authApi";
import { authKeys } from "../../keys";
import { useSignup } from "../useSignup";

vi.mock("../../api/authApi", () => ({
  signup: vi.fn(),
}));

const mockedSignup = vi.mocked(signup);

describe("useSignup", () => {
  beforeEach(() => {
    mockedSignup.mockReset();
  });

  it("calls signup with the signup payload", async () => {
    const queryClient = createTestQueryClient();
    const payload = createSignupPayload();
    const response = createAuthenticatedAuthResponse();

    mockedSignup.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(payload);

    expect(resultData).toEqual(response);
    expect(mockedSignup).toHaveBeenCalledOnce();
    expect(mockedSignup).toHaveBeenCalledWith(payload);
  });

  it("stores the authenticated user in the session query cache", async () => {
    const queryClient = createTestQueryClient();
    const payload = createSignupPayload();
    const response = createAuthenticatedAuthResponse();

    mockedSignup.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });

  it("stores null in the session query cache when signup is unauthenticated", async () => {
    const queryClient = createTestQueryClient();
    const payload = createSignupPayload();
    const response = createUnauthenticatedAuthResponse();

    mockedSignup.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("stores null when an authenticated response has no user", async () => {
    const queryClient = createTestQueryClient();
    const payload = createSignupPayload();
    const response = createAuthenticatedAuthResponse({
      data: {
        user: undefined,
      },
    });

    mockedSignup.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("preserves the session query cache when signup fails", async () => {
    const queryClient = createTestQueryClient();
    const payload = createSignupPayload();
    const existingUser = createAuthUser();

    queryClient.setQueryData(authKeys.session(), existingUser);

    mockedSignup.mockRejectedValueOnce(new Error("Signup failed"));

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(result.current.mutateAsync(payload)).rejects.toThrow(
      "Signup failed",
    );

    expect(queryClient.getQueryData(authKeys.session())).toEqual(existingUser);
  });
});
