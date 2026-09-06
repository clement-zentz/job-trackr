// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useDeleteJobPosting.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { createAuthUser } from "@/tests/factories/auth";
import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { deleteJobPosting } from "../../api/jobPostingsApi";
import { jobPostingsKeys } from "../../keys";
import { useDeleteJobPosting } from "../useDeleteJobPosting";

vi.mock("../../api/jobPostingsApi", () => ({
  deleteJobPosting: vi.fn(),
}));

const mockedDeleteJobPosting = vi.mocked(deleteJobPosting);

describe("useDeleteJobPosting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the requested job posting", async () => {
    const queryClient = createTestQueryClient();

    mockedDeleteJobPosting.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("42");
    });

    expect(mockedDeleteJobPosting).toHaveBeenCalledOnce();
    expect(mockedDeleteJobPosting).toHaveBeenCalledWith(
      "42",
      expect.any(AbortSignal),
    );
  });

  it("invalidates job posting lists after a successful deletion", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockedDeleteJobPosting.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("42");
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledOnce();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.lists(),
    });
  });

  it("does not invalidate job posting lists when deletion fails", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    const error = new Error("Unable to delete job posting");

    mockedDeleteJobPosting.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useDeleteJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync("42");
      }),
    ).rejects.toThrow("Unable to delete job posting");

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobPostingDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof deleteJobPosting>>>();
    mockedDeleteJobPosting.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useDeleteJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof deleteJobPosting>>>;
    act(() => {
      pending = result.current.mutateAsync(record.id);
    });
    await waitFor(() => expect(mockedDeleteJobPosting).toHaveBeenCalled());
    const signal = mockedDeleteJobPosting.mock.lastCall?.[1];
    expect(signal?.aborted).toBe(false);

    resetSessionBoundState(client);
    client.setQueryData(authKeys.session(), createAuthUser({ id: 2 }));
    client.setQueryData(jobPostingsKeys.lists(), ["user B data"]);
    client.setQueryData(jobPostingsKeys.detail(record.id), {
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
