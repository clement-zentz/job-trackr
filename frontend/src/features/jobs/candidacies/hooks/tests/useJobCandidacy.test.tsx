// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useJobCandidacy.test.tsx

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";
import { createWrapper } from "@/tests/utils";

import { getJobCandidacy } from "../../api/jobCandidaciesApi";
import { useJobCandidacy } from "../useJobCandidacy";

vi.mock("../../api/jobCandidaciesApi", () => ({
  getJobCandidacy: vi.fn(),
}));

const mockedGetJobCandidacy = vi.mocked(getJobCandidacy);

describe("useJobCandidacy", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch the job candidacy when the id is empty", () => {
    const wrapper = createWrapper();

    renderHook(() => useJobCandidacy(""), { wrapper });

    expect(mockedGetJobCandidacy).not.toHaveBeenCalled();
  });

  it("fetches the job candidacy when the id is not empty", async () => {
    const jobCandidacy = createJobCandidacyDetailRead({
      id: "job-candidacy-1",
    });

    mockedGetJobCandidacy.mockResolvedValueOnce(jobCandidacy);

    const wrapper = createWrapper();

    const { result } = renderHook(() => useJobCandidacy("job-candidacy-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetJobCandidacy).toHaveBeenCalledTimes(1);
    expect(mockedGetJobCandidacy).toHaveBeenCalledWith("job-candidacy-1");
    expect(result.current.data).toEqual(jobCandidacy);
  });

  it("fetches a different job candidacy when the id changes", async () => {
    const firstJobCandidacy = createJobCandidacyDetailRead({
      id: "job-candidacy-1",
      notes: "First candidacy",
    });

    const secondJobCandidacy = createJobCandidacyDetailRead({
      id: "job-candidacy-2",
      notes: "Second candidacy",
    });

    mockedGetJobCandidacy
      .mockResolvedValueOnce(firstJobCandidacy)
      .mockResolvedValueOnce(secondJobCandidacy);

    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ candidacyId }: { candidacyId: string }) =>
        useJobCandidacy(candidacyId),
      {
        initialProps: {
          candidacyId: "job-candidacy-1",
        },
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstJobCandidacy);
    });

    rerender({ candidacyId: "job-candidacy-2" });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondJobCandidacy);
    });

    expect(mockedGetJobCandidacy).toHaveBeenCalledTimes(2);
    expect(mockedGetJobCandidacy).toHaveBeenNthCalledWith(1, "job-candidacy-1");
    expect(mockedGetJobCandidacy).toHaveBeenNthCalledWith(2, "job-candidacy-2");
  });
});
