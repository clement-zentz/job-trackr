// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/tests/useUpdateAccount.test.ts

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import {
  createUserAccountRead,
  createUserAccountUpdatePayload,
} from "@/tests/factories/account";
import { createAuthUser } from "@/tests/factories/auth";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { updateUserAccount } from "../../api/accountApi";
import { accountKeys } from "../../keys";
import { useUpdateAccount } from "../useUpdateAccount";

vi.mock("../../api/accountApi", () => ({
  updateUserAccount: vi.fn(),
}));

const mockedUpdateUserAccount = vi.mocked(updateUserAccount);

describe("useUpdateAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateUserAccount with the payload", async () => {
    const queryClient = createTestQueryClient();
    const payload = createUserAccountUpdatePayload();
    const updatedAccount = createUserAccountRead({
      username: payload.username,
      first_name: payload.first_name,
      last_name: payload.last_name,
    });

    mockedUpdateUserAccount.mockResolvedValue(updatedAccount);

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(payload);

    expect(resultData).toEqual(updatedAccount);
    expect(mockedUpdateUserAccount).toHaveBeenCalledWith(
      payload,
      expect.any(AbortSignal),
    );
  });

  it("updates the account cache and invalidates the session after a successful update", async () => {
    const queryClient = createTestQueryClient();
    const cancelQueriesSpy = vi.spyOn(queryClient, "cancelQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const previousAccount = createUserAccountRead();
    const updatedAccount = createUserAccountRead({
      username: "updated.username",
      first_name: "Updated",
      last_name: "User",
    });

    queryClient.setQueryData(accountKeys.detail(), previousAccount);

    mockedUpdateUserAccount.mockResolvedValue(updatedAccount);

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(createUserAccountUpdatePayload());

    expect(cancelQueriesSpy).toHaveBeenCalledWith({
      queryKey: accountKeys.detail(),
    });

    expect(queryClient.getQueryData(accountKeys.detail())).toEqual(
      updatedAccount,
    );

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: authKeys.session(),
    });
  });

  it("does not update or invalidate queries when the update fails", async () => {
    const queryClient = createTestQueryClient();
    const previousAccount = createUserAccountRead();

    queryClient.setQueryData(accountKeys.detail(), previousAccount);

    const cancelQueriesSpy = vi.spyOn(queryClient, "cancelQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockedUpdateUserAccount.mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(
      result.current.mutateAsync(createUserAccountUpdatePayload()),
    ).rejects.toThrow("Update failed");

    expect(cancelQueriesSpy).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(accountKeys.detail())).toEqual(
      previousAccount,
    );
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));

    const updatedAccount = createUserAccountRead({
      id: 1,
      username: "user.a.updated",
    });

    const deferred =
      createDeferred<Awaited<ReturnType<typeof updateUserAccount>>>();

    mockedUpdateUserAccount.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    let pending!: Promise<Awaited<ReturnType<typeof updateUserAccount>>>;

    act(() => {
      pending = result.current.mutateAsync(
        createUserAccountUpdatePayload({
          username: "user.a.updated",
        }),
      );
    });

    await waitFor(() => {
      expect(mockedUpdateUserAccount).toHaveBeenCalledOnce();
    });

    const signal = mockedUpdateUserAccount.mock.lastCall?.[1];

    expect(signal?.aborted).toBe(false);

    resetSessionBoundState(queryClient);

    queryClient.setQueryData(authKeys.session(), createAuthUser({ id: 2 }));

    const userBAccount = createUserAccountRead({
      id: 2,
      username: "user.b",
      email: "user.b@example.com",
    });

    queryClient.setQueryData(accountKeys.detail(), userBAccount);

    const cachedQueries = queryClient.getQueriesData({});
    const setDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    expect(signal?.aborted).toBe(true);

    await act(async () => {
      deferred.resolve(updatedAccount);
      await pending;
    });

    expect(setDataSpy).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(queryClient.getQueriesData({})).toEqual(cachedQueries);
  });
});
