// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useUpdateJobPosting.test.tsx

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateJobPosting } from "../../api/jobPostingsApi";
import { jobPostingsKeys } from "../../keys";
import type { JobPostingUpdatePayload } from "../../types";
import { useUpdateJobPosting } from "../useUpdateJobPosting";
import {
  createJobPostingDetailRead,
  createJobPostingUpdatePayload,
} from "@/tests/factories/jobPosting";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

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
});
