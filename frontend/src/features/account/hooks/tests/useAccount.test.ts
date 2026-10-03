// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/tests/useAccount.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserAccountRead } from "@/tests/factories/account";
import { createWrapper } from "@/tests/utils";

import { getUserAccount } from "../../api/accountApi";
import { useAccount } from "../useAccount";

vi.mock("../../api/accountApi", () => ({
  getUserAccount: vi.fn(),
}));

const mockedGetUserAccount = vi.mocked(getUserAccount);

describe("useAccount", () => {
  beforeEach(() => {
    mockedGetUserAccount.mockReset();
  });

  it("returns the user account", async () => {
    const account = createUserAccountRead();

    mockedGetUserAccount.mockResolvedValueOnce(account);

    const { result } = renderHook(() => useAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetUserAccount).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(account);
  });

  it("exposes an error when the request fails", async () => {
    const error = new Error("Request failed");

    mockedGetUserAccount.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedGetUserAccount).toHaveBeenCalledOnce();
    expect(result.current.error).toBe(error);
  });

  it("forwards the query abort signal to the account request", async () => {
    mockedGetUserAccount.mockResolvedValueOnce(createUserAccountRead());

    const { result } = renderHook(() => useAccount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetUserAccount).toHaveBeenCalledWith(expect.any(AbortSignal));
  });
});
