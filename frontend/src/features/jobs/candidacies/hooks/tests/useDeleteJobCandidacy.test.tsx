// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useDeleteJobCandidacy.test.tsx

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

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
    expect(mockedDeleteJobCandidacy).toHaveBeenCalledWith(candidacyId);
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
});
