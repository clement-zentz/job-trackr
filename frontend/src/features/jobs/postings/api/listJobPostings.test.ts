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
  it("maps params correctly", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      page: 2,
      pageSize: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
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

  it("uses defaults when params are missing", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    await listJobPostings();

    expect(api.get).toHaveBeenCalledWith(
      "/v1/jobs/postings/",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
        }),
      }),
    );
  });

  it("removes empty string params", async () => {
    const mockData = createPaginatedResponse([createJobPosting()]);
    (api.get as Mock).mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      search: "",
      platform: undefined,
    });

    const call = (api.get as Mock).mock.calls[0][1].params;

    expect(call.search).toBeUndefined();
    expect(call.platform).toBeUndefined();
  });
});
