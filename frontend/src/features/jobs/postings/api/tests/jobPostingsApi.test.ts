// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/tests/jobPostingsApi.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import {
  createJobPostingCreatePayload,
  createJobPostingDetailRead,
  createJobPostingListItemRead,
} from "@/tests/factories/jobPosting";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";

import { DEFAULT_JOB_POSTINGS_PAGE_SIZE } from "../../constants";
import type { JobPostingDetailRead } from "../../types";
import {
  createJobPosting,
  deleteJobPosting,
  getJobPosting,
  listJobPostings,
  updateJobPosting,
} from "../jobPostingsApi";

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiPatch = vi.mocked(api.patch);
const mockedApiDelete = vi.mocked(api.delete);

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

describe("getJobPosting", () => {
  it("calls the job posting detail endpoint with the given id", async () => {
    const jobPosting: JobPostingDetailRead = createJobPostingDetailRead({
      id: "1",
    });

    mockedApiGet.mockResolvedValueOnce({
      data: jobPosting,
    });

    await getJobPosting("1");

    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/postings/1/");
  });

  it("returns the job posting data from the response", async () => {
    const jobPosting: JobPostingDetailRead = createJobPostingDetailRead({
      id: "1",
    });

    mockedApiGet.mockResolvedValueOnce({
      data: jobPosting,
    });

    const result = await getJobPosting("1");

    expect(result).toEqual(jobPosting);
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

describe("updateJobPosting", () => {
  it("sends a patch request to the job posting detail endpoint", async () => {
    const payload = {
      title: "Senior Backend Engineer",
      active_hiring: true,
    };

    const jobPosting = createJobPostingDetailRead({
      id: "1",
      title: "Senior Backend Engineer",
      active_hiring: true,
    });

    mockedApiPatch.mockResolvedValueOnce({
      data: jobPosting,
    });

    const result = await updateJobPosting("1", payload);

    expect(mockedApiPatch).toHaveBeenCalledTimes(1);
    expect(mockedApiPatch).toHaveBeenCalledWith(
      "/v1/jobs/postings/1/",
      payload,
    );
    expect(result).toEqual(jobPosting);
  });

  it("rejects when the API request fails", async () => {
    const payload = {
      title: "Senior Backend Engineer",
    };

    const error = new Error("Request failed");

    mockedApiPatch.mockRejectedValueOnce(error);

    await expect(updateJobPosting("1", payload)).rejects.toThrow(
      "Request failed",
    );

    expect(mockedApiPatch).toHaveBeenCalledTimes(1);
    expect(mockedApiPatch).toHaveBeenCalledWith(
      "/v1/jobs/postings/1/",
      payload,
    );
  });
});

describe("deleteJobPosting", () => {
  it("deletes the job posting using its detail endpoint", async () => {
    const jobPostingId = "0198a8a4-8c4b-7e20-b5b5-09fb41b977ee";

    mockedApiDelete.mockResolvedValueOnce({
      data: undefined,
    });

    await expect(deleteJobPosting(jobPostingId)).resolves.toBeUndefined();

    expect(mockedApiDelete).toHaveBeenCalledOnce();
    expect(mockedApiDelete).toHaveBeenCalledWith(
      `/v1/jobs/postings/${jobPostingId}/`,
    );
  });

  it("propagates an error when deleting the job posting fails", async () => {
    const jobPostingId = "0198a8a4-8c4b-7e20-b5b5-09fb41b977ee";
    const error = new Error("Failed to delete job posting");

    mockedApiDelete.mockRejectedValueOnce(error);

    await expect(deleteJobPosting(jobPostingId)).rejects.toBe(error);

    expect(mockedApiDelete).toHaveBeenCalledOnce();
    expect(mockedApiDelete).toHaveBeenCalledWith(
      `/v1/jobs/postings/${jobPostingId}/`,
    );
  });
});
