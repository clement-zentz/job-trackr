// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useSession.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthenticatedAuthResponse,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";
import { createWrapper } from "@/tests/utils";

import { getCurrentSession } from "../../api/authApi";
import { useSession } from "../useSession";

vi.mock("../../api/authApi", () => ({
  getCurrentSession: vi.fn(),
}));

const mockedGetCurrentSession = vi.mocked(getCurrentSession);

describe("useSession", () => {
  beforeEach(() => {
    mockedGetCurrentSession.mockReset();
  });

  it("returns the authenticated user", async () => {
    const response = createAuthenticatedAuthResponse();

    mockedGetCurrentSession.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetCurrentSession).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(response.data.user);
  });

  it("returns null when the session is unauthenticated", async () => {
    const response = createUnauthenticatedAuthResponse();

    mockedGetCurrentSession.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetCurrentSession).toHaveBeenCalledOnce();
    expect(result.current.data).toBeNull();
  });

  it("returns null when an authenticated session has no user", async () => {
    const response = createAuthenticatedAuthResponse({
      data: {
        user: undefined,
      },
    });

    mockedGetCurrentSession.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetCurrentSession).toHaveBeenCalledOnce();
    expect(result.current.data).toBeNull();
  });

  it("exposes an error when the request fails", async () => {
    const error = new Error("Request failed");

    mockedGetCurrentSession.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedGetCurrentSession).toHaveBeenCalledOnce();
    expect(result.current.error).toBe(error);
  });
});
