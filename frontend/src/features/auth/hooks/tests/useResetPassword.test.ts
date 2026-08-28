// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useResetPassword.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createAuthUser,
  createResetPasswordPayload,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { resetPassword } from "../../api/authApi";
import { authKeys } from "../../keys";
import { useResetPassword } from "../useResetPassword";

vi.mock("../../api/authApi", () => ({
  resetPassword: vi.fn(),
}));

const mockedResetPassword = vi.mocked(resetPassword);

describe("useResetPassword", () => {
  beforeEach(() => {
    mockedResetPassword.mockReset();
  });

  it("calls resetPassword with the reset password payload", async () => {
    const queryClient = createTestQueryClient();
    const payload = createResetPasswordPayload();
    const response = createAuthenticatedAuthResponse();

    mockedResetPassword.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(payload);

    expect(resultData).toEqual(response);
    expect(mockedResetPassword).toHaveBeenCalledOnce();
    expect(mockedResetPassword).toHaveBeenCalledWith(payload);
  });

  it("stores the authenticated user in the session query cache", async () => {
    const queryClient = createTestQueryClient();
    const payload = createResetPasswordPayload();
    const response = createAuthenticatedAuthResponse();

    mockedResetPassword.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toEqual(
      response.data.user,
    );
  });

  it("stores null in the session query cache when password reset is unauthenticated", async () => {
    const queryClient = createTestQueryClient();
    const payload = createResetPasswordPayload();
    const response = createUnauthenticatedAuthResponse();

    mockedResetPassword.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("stores null when an authenticated response has no user", async () => {
    const queryClient = createTestQueryClient();
    const payload = createResetPasswordPayload();
    const response = createAuthenticatedAuthResponse({
      data: {
        user: undefined,
      },
    });

    mockedResetPassword.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("preserves the session query cache when password reset fails", async () => {
    const queryClient = createTestQueryClient();
    const payload = createResetPasswordPayload();
    const existingUser = createAuthUser();

    queryClient.setQueryData(authKeys.session(), existingUser);

    mockedResetPassword.mockRejectedValueOnce(
      new Error("Password reset failed"),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(result.current.mutateAsync(payload)).rejects.toThrow(
      "Password reset failed",
    );

    expect(queryClient.getQueryData(authKeys.session())).toEqual(existingUser);
  });
});
