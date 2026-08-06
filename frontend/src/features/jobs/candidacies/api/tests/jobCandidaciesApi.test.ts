// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/api/tests/jobCandidaciesApi.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import {
  createJobCandidacyCreatePayload,
  createJobCandidacyDetailRead,
  createJobCandidacyListItemRead,
  createJobCandidacyUpdatePayload,
} from "@/tests/factories/jobCandidacy";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";

import type { JobCandidacyQueryParams } from "../../types";
import {
  createJobCandidacy,
  getJobCandidacy,
  listJobCandidacies,
  updateJobCandidacy,
} from "../jobCandidaciesApi";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiPatch = vi.mocked(api.patch);

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

describe("getJobCandidacy", () => {
  it("calls the job candidacy detail endpoint with the given id", async () => {
    const jobCandidacy = createJobCandidacyDetailRead({
      id: "1",
    });

    mockedApiGet.mockResolvedValueOnce({
      data: jobCandidacy,
    });

    await getJobCandidacy("1");

    expect(mockedApiGet).toHaveBeenCalledWith("/v1/jobs/candidacies/1/");
  });

  it("returns the job candidacy data from the response", async () => {
    const jobCandidacy = createJobCandidacyDetailRead({
      id: "1",
    });

    mockedApiGet.mockResolvedValueOnce({
      data: jobCandidacy,
    });

    const result = await getJobCandidacy("1");

    expect(result).toEqual(jobCandidacy);
  });
});

describe("createJobCandidacy", () => {
  it("posts the payload to the job candidacies endpoint", async () => {
    const payload = createJobCandidacyCreatePayload();
    const jobCandidacy = createJobCandidacyDetailRead();

    mockedApiPost.mockResolvedValueOnce({
      data: jobCandidacy,
    });

    const result = await createJobCandidacy(payload);

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/v1/jobs/candidacies/",
      payload,
    );
    expect(result).toEqual(jobCandidacy);
  });

  it("propagates an error when the API request fails", async () => {
    const payload = createJobCandidacyCreatePayload();
    const error = new Error("Failed to create job candidacy");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(createJobCandidacy(payload)).rejects.toBe(error);

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/v1/jobs/candidacies/",
      payload,
    );
  });
});

describe("updateJobCandidacy", () => {
  it("patches the candidacy and returns the updated data", async () => {
    const candidacyId = "candidacy-1";
    const payload = createJobCandidacyUpdatePayload();
    const jobCandidacy = createJobCandidacyDetailRead({
      id: candidacyId,
      status: payload.status,
      status_label: "Interview",
      applied_on: payload.applied_on,
      notes: payload.notes,
    });

    mockedApiPatch.mockResolvedValueOnce({
      data: jobCandidacy,
    });

    const result = await updateJobCandidacy(candidacyId, payload);

    expect(mockedApiPatch).toHaveBeenCalledOnce();
    expect(mockedApiPatch).toHaveBeenCalledWith(
      `/v1/jobs/candidacies/${candidacyId}/`,
      payload,
    );
    expect(result).toEqual(jobCandidacy);
  });

  it("propagates an error when the API request fails", async () => {
    const candidacyId = "candidacy-1";
    const payload = createJobCandidacyUpdatePayload();
    const error = new Error("Failed to update job candidacy");

    mockedApiPatch.mockRejectedValueOnce(error);

    await expect(updateJobCandidacy(candidacyId, payload)).rejects.toBe(error);

    expect(mockedApiPatch).toHaveBeenCalledOnce();
    expect(mockedApiPatch).toHaveBeenCalledWith(
      `/v1/jobs/candidacies/${candidacyId}/`,
      payload,
    );
  });
});
