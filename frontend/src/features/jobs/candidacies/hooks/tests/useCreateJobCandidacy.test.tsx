// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useCreateJobCandidacy.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import { createAuthUser } from "@/tests/factories/auth";
import {
  createJobCandidacyCreatePayload,
  createJobCandidacyDetailRead,
} from "@/tests/factories/jobCandidacy";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { createJobCandidacy } from "../../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../../keys";
import { useCreateJobCandidacy } from "../useCreateJobCandidacy";

vi.mock("../../api/jobCandidaciesApi", () => ({
  createJobCandidacy: vi.fn(),
}));

const mockedCreateJobCandidacy = vi.mocked(createJobCandidacy);

describe("useCreateJobCandidacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls createJobCandidacy with the creation payload", async () => {
    const queryClient = createTestQueryClient();

    const payload = createJobCandidacyCreatePayload({
      job_posting: "job-posting-1",
    });

    const createdCandidacy = createJobCandidacyDetailRead({
      id: "candidacy-1",
      job_posting: {
        id: "job-posting-1",
      },
    });

    mockedCreateJobCandidacy.mockResolvedValueOnce(createdCandidacy);

    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const resultData = await result.current.mutateAsync(payload);

    expect(resultData).toEqual(createdCandidacy);
    expect(mockedCreateJobCandidacy).toHaveBeenCalledOnce();
    expect(mockedCreateJobCandidacy).toHaveBeenCalledWith(
      payload,
      expect.any(AbortSignal),
    );
  });

  it("stores the created candidacy in the detail query cache", async () => {
    const queryClient = createTestQueryClient();

    const payload = createJobCandidacyCreatePayload({
      job_posting: "job-posting-1",
    });

    const createdCandidacy = createJobCandidacyDetailRead({
      id: "candidacy-1",
      job_posting: {
        id: "job-posting-1",
      },
    });

    mockedCreateJobCandidacy.mockResolvedValueOnce(createdCandidacy);

    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(createdCandidacy.id)),
    ).toEqual(createdCandidacy);
  });

  it("invalidates related queries after successful creation", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const payload = createJobCandidacyCreatePayload({
      job_posting: "job-posting-1",
    });

    const createdCandidacy = createJobCandidacyDetailRead({
      id: "candidacy-1",
      job_posting: {
        id: "job-posting-1",
      },
    });

    mockedCreateJobCandidacy.mockResolvedValueOnce(createdCandidacy);

    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync(payload);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobCandidaciesKeys.lists(),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.lists(),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.detail(createdCandidacy.job_posting.id),
    });
  });

  it("does not update or invalidate queries when creation fails", async () => {
    const queryClient = createTestQueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const payload = createJobCandidacyCreatePayload();

    mockedCreateJobCandidacy.mockRejectedValueOnce(
      new Error("Creation failed"),
    );

    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(result.current.mutateAsync(payload)).rejects.toThrow(
      "Creation failed",
    );

    expect(setQueryDataSpy).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobCandidacyDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof createJobCandidacy>>>();
    mockedCreateJobCandidacy.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateJobCandidacy(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof createJobCandidacy>>>;
    act(() => {
      pending = result.current.mutateAsync(createJobCandidacyCreatePayload());
    });
    await waitFor(() => expect(mockedCreateJobCandidacy).toHaveBeenCalled());
    const signal = mockedCreateJobCandidacy.mock.lastCall?.[1];
    expect(signal?.aborted).toBe(false);

    resetSessionBoundState(client);
    client.setQueryData(authKeys.session(), createAuthUser({ id: 2 }));
    client.setQueryData(jobCandidaciesKeys.lists(), ["user B data"]);
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
