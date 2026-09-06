// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useCreateJobPosting.test.tsx

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { authKeys } from "@/features/auth/keys";
import { createAuthUser } from "@/tests/factories/auth";
import {
  createJobPostingCreatePayload,
  createJobPostingDetailRead,
} from "@/tests/factories/jobPosting";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { createJobPosting } from "../../api/jobPostingsApi";
import { jobPostingsKeys } from "../../keys";
import { useCreateJobPosting } from "../useCreateJobPosting";

vi.mock("../../api/jobPostingsApi", () => ({
  createJobPosting: vi.fn(),
}));

const mockedCreateJobPosting = vi.mocked(createJobPosting);

describe("useCreateJobPosting", () => {
  it("calls createJobPosting with the creation payload", async () => {
    const client = createTestQueryClient();
    const createdJobPosting = createJobPostingDetailRead();
    const payload = createJobPostingCreatePayload();

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(mockedCreateJobPosting).toHaveBeenCalledOnce();
    });

    expect(mockedCreateJobPosting).toHaveBeenCalledWith(
      payload,
      expect.any(AbortSignal),
    );
  });

  it("returns the created job posting on success", async () => {
    const client = createTestQueryClient();
    const createdJobPosting = createJobPostingDetailRead({
      id: "job-456",
      title: "Frontend Engineer",
      company: "Globex",
    });
    const payload = createJobPostingCreatePayload({
      title: "Frontend Engineer",
      company: "Globex",
    });

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdJobPosting);
  });

  it("invalidates the job postings query after successful creation", async () => {
    const client = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const createdJobPosting = createJobPostingDetailRead();
    const payload = createJobPostingCreatePayload();

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: jobPostingsKeys.lists(),
      });
    });
  });

  it("ignores a late success after an auth boundary even if the request ignores abort", async () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const record = createJobPostingDetailRead();
    const deferred =
      createDeferred<Awaited<ReturnType<typeof createJobPosting>>>();
    mockedCreateJobPosting.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });
    let pending!: Promise<Awaited<ReturnType<typeof createJobPosting>>>;
    act(() => {
      pending = result.current.mutateAsync(createJobPostingCreatePayload());
    });
    await waitFor(() => expect(mockedCreateJobPosting).toHaveBeenCalled());
    const signal = mockedCreateJobPosting.mock.lastCall?.[1];
    expect(signal?.aborted).toBe(false);

    resetSessionBoundState(client);
    client.setQueryData(authKeys.session(), createAuthUser({ id: 2 }));
    client.setQueryData(jobPostingsKeys.lists(), ["user B data"]);
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
