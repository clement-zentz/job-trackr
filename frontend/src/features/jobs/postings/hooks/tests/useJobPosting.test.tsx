// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useJobPosting.test.tsx

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createJobPostingDetailRead } from "@/tests/factories/jobPosting";
import { createWrapper } from "@/tests/utils";

import { getJobPosting } from "../../api/jobPostingsApi";
import { useJobPosting } from "../useJobPosting";

vi.mock("../../api/jobPostingsApi", () => ({
  getJobPosting: vi.fn(),
}));

const mockedGetJobPosting = vi.mocked(getJobPosting);

describe("useJobPosting", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch the job posting when the id is undefined", () => {
    const wrapper = createWrapper();

    renderHook(() => useJobPosting(undefined), { wrapper });

    expect(mockedGetJobPosting).not.toHaveBeenCalled();
  });

  it("fetches the job posting when the id is defined", async () => {
    const jobPosting = createJobPostingDetailRead({
      id: "job-posting-1",
    });

    mockedGetJobPosting.mockResolvedValueOnce(jobPosting);

    const wrapper = createWrapper();

    const { result } = renderHook(() => useJobPosting("job-posting-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedGetJobPosting).toHaveBeenCalledTimes(1);
    expect(mockedGetJobPosting).toHaveBeenCalledWith("job-posting-1");
    expect(result.current.data).toEqual(jobPosting);
  });

  it("fetches a different job posting when the id changes", async () => {
    const firstJobPosting = createJobPostingDetailRead({
      id: "job-posting-1",
      title: "Frontend Developer",
    });

    const secondJobPosting = createJobPostingDetailRead({
      id: "job-posting-2",
      title: "Backend Developer",
    });

    mockedGetJobPosting
      .mockResolvedValueOnce(firstJobPosting)
      .mockResolvedValueOnce(secondJobPosting);

    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ id }: { id: string | undefined }) => useJobPosting(id),
      {
        initialProps: {
          id: "job-posting-1",
        },
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstJobPosting);
    });

    rerender({ id: "job-posting-2" });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondJobPosting);
    });

    expect(mockedGetJobPosting).toHaveBeenCalledTimes(2);
    expect(mockedGetJobPosting).toHaveBeenNthCalledWith(1, "job-posting-1");
    expect(mockedGetJobPosting).toHaveBeenNthCalledWith(2, "job-posting-2");
  });
});
