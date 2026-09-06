// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useDeleteJobCandidacy.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import { createAuthUser } from "@/tests/factories/auth";
import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { deleteJobCandidacy } from "../../api/jobCandidaciesApi";
import { jobCandidaciesKeys } from "../../keys";
import { useDeleteJobCandidacy } from "../useDeleteJobCandidacy";

vi.mock("../../api/jobCandidaciesApi", () => ({
  deleteJobCandidacy: vi.fn(),
}));

const mockedDeleteJobCandidacy = vi.mocked(deleteJobCandidacy);

const candidacyId = "candidacy-1";
const jobPostingId = "job-posting-1";

const candidacy = createJobCandidacyDetailRead({
  id: candidacyId,
  job_posting: {
    id: jobPostingId,
    title: "Frontend Developer",
    company: "Acme",
    location: "Paris",
  },
});

describe("useDeleteJobCandidacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the candidacy with the provided id", async () => {
    const queryClient = createTestQueryClient();
    mockedDeleteJobCandidacy.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync({
      candidacyId,
      jobPostingId,
    });

    expect(mockedDeleteJobCandidacy).toHaveBeenCalledOnce();
    expect(mockedDeleteJobCandidacy).toHaveBeenCalledWith(
      candidacyId,
      expect.any(AbortSignal),
    );
  });

  it("removes the candidacy detail and invalidates related queries", async () => {
    const queryClient = createTestQueryClient();
    const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(jobCandidaciesKeys.detail(candidacyId), candidacy);

    mockedDeleteJobCandidacy.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await result.current.mutateAsync({
      candidacyId,
      jobPostingId,
    });

    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(candidacyId)),
    ).toBeUndefined();

    expect(removeQueriesSpy).toHaveBeenCalledOnce();
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobCandidaciesKeys.detail(candidacyId),
      exact: true,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobCandidaciesKeys.lists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.lists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.detail(jobPostingId),
    });
  });

  it("does not change caches when the deletion fails", async () => {
    const queryClient = createTestQueryClient();
    const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(jobCandidaciesKeys.detail(candidacyId), candidacy);

    mockedDeleteJobCandidacy.mockRejectedValueOnce(new Error("Delete failed"));

    const { result } = renderHook(() => useDeleteJobCandidacy(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        candidacyId,
        jobPostingId,
      }),
    ).rejects.toThrow("Delete failed");

    expect(
      queryClient.getQueryData(jobCandidaciesKeys.detail(candidacyId)),
    ).toEqual(candidacy);

    expect(removeQueriesSpy).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobCandidacyDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof deleteJobCandidacy>>>();
    mockedDeleteJobCandidacy.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useDeleteJobCandidacy(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof deleteJobCandidacy>>>;
    act(() => {
      pending = result.current.mutateAsync({
        candidacyId: record.id,
        jobPostingId: record.job_posting.id,
      });
    });
    await waitFor(() => expect(mockedDeleteJobCandidacy).toHaveBeenCalled());
    const signal = mockedDeleteJobCandidacy.mock.lastCall?.[1];
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
      deferred.resolve(undefined);
      await pending;
    });

    expect(setData).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(client.getQueriesData({})).toEqual(cachedQueries);
  });
});
