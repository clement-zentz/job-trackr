// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useUpdateJobPosting.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { createAuthUser } from "@/tests/factories/auth";
import {
  createJobPostingDetailRead,
  createJobPostingUpdatePayload,
} from "@/tests/factories/jobPosting";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { updateJobPosting } from "../../api/jobPostingsApi";
import { jobPostingsKeys } from "../../keys";
import type { JobPostingUpdatePayload } from "../../types";
import { useUpdateJobPosting } from "../useUpdateJobPosting";

vi.mock("../../api/jobPostingsApi", () => ({
  updateJobPosting: vi.fn(),
}));

const mockedUpdateJobPosting = vi.mocked(updateJobPosting);

describe("useUpdateJobPosting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateJobPosting with the given id and payload", async () => {
    const queryClient = createTestQueryClient();

    const updatedJobPosting = createJobPostingDetailRead({
      id: "job-posting-1",
      title: "Frontend Developer",
      company: "Example Company",
    });

    mockedUpdateJobPosting.mockResolvedValue(updatedJobPosting);

    const { result } = renderHook(() => useUpdateJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const payload: JobPostingUpdatePayload = createJobPostingUpdatePayload({
      title: "Frontend Developer",
      company: "Example Company",
    });

    const resultData = await result.current.mutateAsync({
      id: "job-posting-1",
      payload,
    });

    expect(resultData).toEqual(updatedJobPosting);

    expect(mockedUpdateJobPosting).toHaveBeenCalledWith(
      "job-posting-1",
      payload,
      expect.any(AbortSignal),
    );
  });

  it("invalidates job posting list and detail queries after a successful update", async () => {
    const queryClient = createTestQueryClient();

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const updatedJobPosting = createJobPostingDetailRead({
      id: "job-posting-1",
      title: "Updated Frontend Developer",
      company: "Example Company",
    });

    mockedUpdateJobPosting.mockResolvedValue(updatedJobPosting);

    const { result } = renderHook(() => useUpdateJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const payload: JobPostingUpdatePayload = createJobPostingUpdatePayload({
      title: "Updated Frontend Developer",
      company: "Example Company",
    });

    await result.current.mutateAsync({
      id: "job-posting-1",
      payload,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.lists(),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: jobPostingsKeys.detail(updatedJobPosting.id),
    });
  });

  it("does not invalidate queries when the update fails", async () => {
    const queryClient = createTestQueryClient();

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockedUpdateJobPosting.mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useUpdateJobPosting(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    const payload: JobPostingUpdatePayload = createJobPostingUpdatePayload({
      title: "Broken update",
      company: "Example Company",
    });

    await expect(
      result.current.mutateAsync({
        id: "job-posting-1",
        payload,
      }),
    ).rejects.toThrow("Update failed");

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobPostingDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof updateJobPosting>>>();
    mockedUpdateJobPosting.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useUpdateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof updateJobPosting>>>;
    act(() => {
      pending = result.current.mutateAsync({
        id: record.id,
        payload: createJobPostingUpdatePayload(),
      });
    });
    await waitFor(() => expect(mockedUpdateJobPosting).toHaveBeenCalled());
    const signal = mockedUpdateJobPosting.mock.lastCall?.[2];
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
      deferred.resolve(record);
      await pending;
    });

    expect(setData).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(client.getQueriesData({})).toEqual(cachedQueries);
  });
});
