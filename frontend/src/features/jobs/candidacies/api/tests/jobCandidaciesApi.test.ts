// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/tests/jobCandidaciesApi.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import { createJobCandidacyListItemRead } from "@/tests/factories/jobCandidacy";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";

import type { JobCandidacyQueryParams } from "../../types";
import { listJobCandidacies } from "../jobCandidaciesApi";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listJobCandidacies", () => {
  const params: JobCandidacyQueryParams = {
    page: 2,
    page_size: 10,
  };

  it("passes the query params to the job candidacies endpoint", async () => {
    const mockData = createPaginatedResponse([
      createJobCandidacyListItemRead(),
    ]);

    mockedApiGet.mockResolvedValueOnce({
      data: mockData,
    });

    await listJobCandidacies(params);

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/candidacies/", {
      params,
    });
  });

  it("returns the paginated candidacy data from the response", async () => {
    const candidacies = [
      createJobCandidacyListItemRead({
        id: "candidacy-1",
        job_posting: {
          id: "job-posting-1",
        },
      }),
      createJobCandidacyListItemRead({
        id: "candidacy-2",
        job_posting: {
          id: "job-posting-2",
        },
      }),
    ];

    const mockData = createPaginatedResponse(candidacies, {
      count: 12,
      next: "http://localhost/v1/jobs/candidacies/?page=3",
      previous: "http://localhost/v1/jobs/candidacies/?page=1",
    });

    mockedApiGet.mockResolvedValueOnce({
      data: mockData,
    });

    const result = await listJobCandidacies(params);

    expect(result).toEqual(mockData);
  });

  it("propagates an error when the API request fails", async () => {
    const error = new Error("Failed to list job candidacies");

    mockedApiGet.mockRejectedValueOnce(error);

    await expect(listJobCandidacies(params)).rejects.toBe(error);

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/candidacies/", {
      params,
    });
  });
});
