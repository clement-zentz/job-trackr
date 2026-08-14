// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/hooks/tests/useJobCandidacies.test.ts

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobCandidacyListItemRead } from "@/tests/factories/jobCandidacy";
import { createPaginatedResponse } from "@/tests/factories/paginatedResponse";
import { createWrapper } from "@/tests/utils";

import * as api from "../../api/jobCandidaciesApi";
import { DEFAULT_JOB_CANDIDACIES_PAGE_SIZE } from "../../constants";
import { useJobCandidacies } from "../useJobCandidacies";

vi.mock("../../api/jobCandidaciesApi", () => ({
  listJobCandidacies: vi.fn(),
}));

const listJobCandidaciesMock = vi.mocked(api.listJobCandidacies);

describe("useJobCandidacies", () => {
  beforeEach(() => {
    listJobCandidaciesMock.mockReset();
  });

  it("loads job candidacies with the default parameters", async () => {
    const response = createPaginatedResponse([]);

    listJobCandidaciesMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useJobCandidacies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(response);

      expect(listJobCandidaciesMock).toHaveBeenCalledOnce();
      expect(listJobCandidaciesMock).toHaveBeenCalledWith({
        page: 1,
        page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
      });
    });
  });

  it("normalizes and passes the provided parameters to the API", async () => {
    const response = createPaginatedResponse([]);

    listJobCandidaciesMock.mockResolvedValueOnce(response);

    const { result } = renderHook(
      () =>
        useJobCandidacies({
          page: 3,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(response);

      expect(listJobCandidaciesMock).toHaveBeenCalledOnce();
      expect(listJobCandidaciesMock).toHaveBeenCalledWith({
        page: 3,
        page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
      });
    });
  });

  it("exposes an error when the request fails", async () => {
    const error = new Error("Request failed");

    listJobCandidaciesMock.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useJobCandidacies({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
      expect(listJobCandidaciesMock).toHaveBeenCalledOnce();
    });
  });

  it("keeps the previous page data while the next page is loading", async () => {
    const firstCandidacy = createJobCandidacyListItemRead({
      id: "candidacy-1",
      job_posting: {
        id: "job-posting-1",
      },
    });
    const firstPage = createPaginatedResponse([firstCandidacy]);

    const secondCandidacy = createJobCandidacyListItemRead({
      id: "candidacy-2",
      job_posting: {
        id: "job-posting-2",
      },
    });
    const secondPage = createPaginatedResponse([secondCandidacy]);

    let resolveSecondPage!: (response: typeof secondPage) => void;

    const pendingSecondPage = new Promise<typeof secondPage>((resolve) => {
      resolveSecondPage = resolve;
    });

    listJobCandidaciesMock
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(pendingSecondPage);

    const { result, rerender } = renderHook(
      ({ page }) =>
        useJobCandidacies({
          page,
        }),
      {
        initialProps: {
          page: 1,
        },
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.results).toEqual([firstCandidacy]);
      expect(result.current.isPlaceholderData).toBe(false);
      expect(result.current.isFetching).toBe(false);

      expect(listJobCandidaciesMock).toHaveBeenCalledOnce();
      expect(listJobCandidaciesMock).toHaveBeenCalledWith({
        page: 1,
        page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
      });
    });

    rerender({
      page: 2,
    });

    await waitFor(() => {
      expect(listJobCandidaciesMock).toHaveBeenCalledTimes(2);
      expect(listJobCandidaciesMock).toHaveBeenLastCalledWith({
        page: 2,
        page_size: DEFAULT_JOB_CANDIDACIES_PAGE_SIZE,
      });

      expect(result.current.data?.results).toEqual([firstCandidacy]);
      expect(result.current.isPlaceholderData).toBe(true);
      expect(result.current.isFetching).toBe(true);
    });

    await act(async () => {
      resolveSecondPage(secondPage);
    });

    await waitFor(() => {
      expect(result.current.data?.results).toEqual([secondCandidacy]);
      expect(result.current.isPlaceholderData).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });
  });
});
