// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useDeleteJobPosting.test.tsx

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

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
    expect(mockedDeleteJobPosting).toHaveBeenCalledWith("42");
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
});
