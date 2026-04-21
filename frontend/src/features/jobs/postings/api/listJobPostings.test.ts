// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/listJobPostings.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { listJobPostings } from "./listJobPostings";
import { api } from "@/api/client";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import { createJobPosting } from "@/tests/factories/jobPosting";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../constants";

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("listJobPostings", () => {
  it("passes params correctly to API", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      page: 2,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
      search: "python",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/jobs/postings/",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 2,
          page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
          search: "python",
        }),
      }),
    );
  });

  it("works with minimal params", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    });

    expect(api.get).toHaveBeenCalled();
  });

  it("does not modify params", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    const params = {
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    };

    await listJobPostings(params);

    const call = (api.get as Mock).mock.calls[0][1].params;

    expect(call).toEqual(params);
  });
});
