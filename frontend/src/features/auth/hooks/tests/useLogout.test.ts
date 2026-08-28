// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useLogout.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import {
  createAuthUser,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { logout } from "../../api/authApi";
import { authKeys } from "../../keys";
import { useLogout } from "../useLogout";

vi.mock("../../api/authApi", () => ({
  logout: vi.fn(),
}));

const mockedLogout = vi.mocked(logout);

describe("useLogout", () => {
  beforeEach(() => {
    mockedLogout.mockReset();
  });

  it("calls logout", async () => {
    const queryClient = createTestQueryClient();
    const response = createUnauthenticatedAuthResponse({
      status: 200,
    });

    mockedLogout.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync();

    expect(resultData).toEqual(response);
    expect(mockedLogout).toHaveBeenCalledOnce();
    expect(mockedLogout).toHaveBeenCalledWith();
  });

  it("clears the session query cache after successful logout", async () => {
    const queryClient = createTestQueryClient();
    const user = createAuthUser();
    const response = createUnauthenticatedAuthResponse({
      status: 200,
    });

    queryClient.setQueryData(authKeys.session(), user);

    mockedLogout.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync();

    expect(queryClient.getQueryData(authKeys.session())).toBeNull();
  });

  it("removes non-auth queries after successful logout", async () => {
    const queryClient = createTestQueryClient();
    const response = createUnauthenticatedAuthResponse({
      status: 200,
    });

    queryClient.setQueryData(jobPostingsKeys.all, ["cached-job-postings"]);

    mockedLogout.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync();

    expect(queryClient.getQueryData(jobPostingsKeys.all)).toBeUndefined();
  });

  it("preserves other auth queries after successful logout", async () => {
    const queryClient = createTestQueryClient();
    const response = createUnauthenticatedAuthResponse({
      status: 200,
    });
    const authQueryKey = [...authKeys.all, "other"] as const;
    const authQueryData = { value: "cached-auth-data" };

    queryClient.setQueryData(authQueryKey, authQueryData);

    mockedLogout.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync();

    expect(queryClient.getQueryData(authQueryKey)).toEqual(authQueryData);
  });

  it("preserves cached queries when logout fails", async () => {
    const queryClient = createTestQueryClient();
    const user = createAuthUser();
    const cachedJobPostings = ["cached-job-postings"];

    queryClient.setQueryData(authKeys.session(), user);
    queryClient.setQueryData(jobPostingsKeys.all, cachedJobPostings);

    mockedLogout.mockRejectedValueOnce(new Error("Logout failed"));

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow("Logout failed");

    expect(queryClient.getQueryData(authKeys.session())).toEqual(user);
    expect(queryClient.getQueryData(jobPostingsKeys.all)).toEqual(
      cachedJobPostings,
    );
  });
});
