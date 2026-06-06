// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/tests/jobPostingsApi.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { listJobPostings, createJobPosting } from "../jobPostingsApi";
import { api } from "@/api/client";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import {
  createJobPostingListItemRead,
  createJobPostingCreatePayload,
  createJobPostingDetailRead,
} from "@/tests/factories/jobPosting";
import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../../constants";

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);

describe("listJobPostings", () => {
  it("passes params correctly to API", async () => {
    const mockData = createPaginatedResponse([createJobPostingListItemRead()]);
    mockedApiGet.mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      page: 2,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
      search: "python",
    });

    expect(mockedApiGet).toHaveBeenCalledWith(
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

  it("passes minimal params to API", async () => {
    const mockData = createPaginatedResponse([createJobPostingListItemRead()]);
    mockedApiGet.mockResolvedValueOnce({ data: mockData });

    await listJobPostings({
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    });

    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/postings/", {
      params: {
        page: 1,
        page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
      },
    });
  });

  it("passes params without modification", async () => {
    const mockData = createPaginatedResponse([createJobPostingListItemRead()]);
    mockedApiGet.mockResolvedValueOnce({ data: mockData });

    const params = {
      page: 1,
      page_size: DEFAULT_JOB_POSTINGS_PAGE_SIZE,
    };

    await listJobPostings(params);

    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/postings/", {
      params,
    });
  });
});

describe("createJobPosting", () => {
  it("posts the payload to the job postings endpoint", async () => {
    const payload = createJobPostingCreatePayload();

    const jobPosting = createJobPostingDetailRead();

    mockedApiPost.mockResolvedValueOnce({
      data: jobPosting,
    });

    const result = await createJobPosting(payload);

    expect(mockedApiPost).toHaveBeenCalledWith("/v1/jobs/postings/", payload);
    expect(result).toEqual(jobPosting);
  });

  it("rejects when the API request fails", async () => {
    const payload = createJobPostingCreatePayload();

    const error = new Error("Request failed");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(createJobPosting(payload)).rejects.toThrow("Request failed");

    expect(mockedApiPost).toHaveBeenCalledWith("/v1/jobs/postings/", payload);
  });
});
