// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useUpdateJobCandidacy.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { createAuthUser } from "@/tests/factories/auth";
import {
  createJobCandidacyDetailRead,
  createJobCandidacyUpdatePayload,
} from "@/tests/factories/jobCandidacy";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { updateJobCandidacy } from "../../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../../keys";
import { useUpdateJobCandidacy } from "../useUpdateJobCandidacy";

vi.mock("../../api/jobCandidaciesApi", () => ({
  updateJobCandidacy: vi.fn(),
}));

const mockedUpdateJobCandidacy = vi.mocked(updateJobCandidacy);

describe("useUpdateJobCandidacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateJobCandidacy with the candidacy id and update payload", async () => {
    const queryClient = createTestQueryClient();

    const candidacyId = "candidacy-1";
    const payload = createJobCandidacyUpdatePayload();
    const updatedCandidacy = createJobCandidacyDetailRead({
      id: candidacyId,
      status: payload.status,
      applied_on: payload.applied_on,
      notes: payload.notes,
    });

    mockedUpdateJobCandidacy.mockResolvedValueOnce(updatedCandidacy);

    const { result } = renderHook(() => useUpdateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync({
      candidacyId,
      payload,
    });

    expect(resultData).toEqual(updatedCandidacy);
    expect(mockedUpdateJobCandidacy).toHaveBeenCalledOnce();
    expect(mockedUpdateJobCandidacy).toHaveBeenCalledWith(
      candidacyId,
      payload,
      expect.any(AbortSignal),
    );
  });

  it("stores the updated candidacy in the detail query cache", async () => {
    const queryClient = createTestQueryClient();

    const candidacyId = "candidacy-1";
    const payload = createJobCandidacyUpdatePayload();
    const updatedCandidacy = createJobCandidacyDetailRead({
      id: candidacyId,
      status: payload.status,
      applied_on: payload.applied_on,
      notes: payload.notes,
    });

    mockedUpdateJobCandidacy.mockResolvedValueOnce(updatedCandidacy);

    const { result } = renderHook(() => useUpdateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync({
      candidacyId,
      payload,
    });

    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(updatedCandidacy.id)),
    ).toEqual(updatedCandidacy);
  });

  it("invalidates candidacy list queries after a successful update", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const candidacyId = "candidacy-1";
    const payload = createJobCandidacyUpdatePayload();
    const updatedCandidacy = createJobCandidacyDetailRead({
      id: candidacyId,
      status: payload.status,
      applied_on: payload.applied_on,
      notes: payload.notes,
    });

    mockedUpdateJobCandidacy.mockResolvedValueOnce(updatedCandidacy);

    const { result } = renderHook(() => useUpdateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync({
      candidacyId,
      payload,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledOnce();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobCandidaciesKeys.lists(),
    });
  });

  it("does not update or invalidate queries when the update fails", async () => {
    const queryClient = createTestQueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const payload = createJobCandidacyUpdatePayload();

    mockedUpdateJobCandidacy.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useUpdateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        candidacyId: "candidacy-1",
        payload,
      }),
    ).rejects.toThrow("Update failed");

    expect(setQueryDataSpy).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobCandidacyDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof updateJobCandidacy>>>();
    mockedUpdateJobCandidacy.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useUpdateJobCandidacy(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof updateJobCandidacy>>>;
    act(() => {
      pending = result.current.mutateAsync({
        candidacyId: record.id,
        payload: createJobCandidacyUpdatePayload(),
      });
    });
    await waitFor(() => expect(mockedUpdateJobCandidacy).toHaveBeenCalled());
    const signal = mockedUpdateJobCandidacy.mock.lastCall?.[2];
    expect(signal?.aborted).toBe(false);

    resetSessionBoundState(client);
    client.setQueryData(authKeys.session(), createAuthUser({ id: 2 }));
    client.setQueryData(jobCandidaciesKeys.lists(), ["user B data"]);
    client.setQueryData(jobCandidaciesKeys.detail(record.id), {
      ...record,
      notes: "user B data",
    });
    const cachedQueries = client.getQueriesData({});
    const setData = vi.spyOn(client, "setQueryData");
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const remove = vi.spyOn(client, "removeQueries");
    expect(signal?.aborted).toBe(true);

    await act(async () => {
      deferred.resolve(record);
      await pending;
    });

    expect(setData).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(client.getQueriesData({})).toEqual(cachedQueries);
  });
});
