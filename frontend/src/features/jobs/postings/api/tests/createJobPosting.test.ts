// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/api/tests/createJobPosting.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import {
  createJobPostingCreatePayload,
  createJobPostingDetailRead,
} from "@/tests/factories/jobPosting";
import { createJobPosting } from "../createJobPosting";

vi.mock("@/api/client", () => ({
  api: {
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockedApiPost = vi.mocked(api.post);

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
