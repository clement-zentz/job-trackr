// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostings.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useJobPostings } from "./useJobPostings";
import * as api from "../api/listJobPostings";
import { createWrapper } from "@/tests/utils";
import { createJobPosting } from "@/tests/factories/jobPosting";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import type { JobPostingListParams } from "../types";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

const defaultParams: JobPostingListParams = {
  page: 1,
  pageSize: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
  ordering: "-posted_at",
};

describe("useJobPostings", () => {
  it("returns data on success", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);

    vi.spyOn(api, "listJobPostings").mockResolvedValue(mockData);

    const { result } = renderHook(() => useJobPostings(defaultParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });

  it("handles error state", async () => {
    vi.spyOn(api, "listJobPostings").mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useJobPostings(defaultParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
