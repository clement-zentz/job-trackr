// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useCreateJobCandidacy.test.tsx

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jobPostingsKeys } from "@/features/jobs/postings/keys";
import {
  createJobCandidacyCreatePayload,
  createJobCandidacyDetailRead,
} from "@/tests/factories/jobCandidacy";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

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
    expect(mockedCreateJobCandidacy).toHaveBeenCalledWith(payload);
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
});
