// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/tests/useCreateJobPosting.test.tsx

import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createJobPosting } from "../../api/jobPostingsApi";
import { useCreateJobPosting } from "../useCreateJobPosting";
import {
  createJobPostingCreatePayload,
  createJobPostingDetailRead,
} from "@/tests/factories/jobPosting";
import { createTestQueryClient } from "@/tests/utils";

vi.mock("../../api/jobPostingsApi", () => ({
  createJobPosting: vi.fn(),
}));

const mockedCreateJobPosting = vi.mocked(createJobPosting);

function createWrapperWithClient(
  client: ReturnType<typeof createTestQueryClient>,
) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useCreateJobPosting", () => {
  it("calls createJobPosting with the creation payload", async () => {
    const client = createTestQueryClient();
    const createdJobPosting = createJobPostingDetailRead();
    const payload = createJobPostingCreatePayload();

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(mockedCreateJobPosting).toHaveBeenCalledOnce();
    });

    expect(mockedCreateJobPosting).toHaveBeenCalledWith(payload);
  });

  it("returns the created job posting on success", async () => {
    const client = createTestQueryClient();
    const createdJobPosting = createJobPostingDetailRead({
      id: "job-456",
      title: "Frontend Engineer",
      company: "Globex",
    });
    const payload = createJobPostingCreatePayload({
      title: "Frontend Engineer",
      company: "Globex",
    });

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdJobPosting);
  });

  it("invalidates the job postings query after successful creation", async () => {
    const client = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const createdJobPosting = createJobPostingDetailRead();
    const payload = createJobPostingCreatePayload();

    mockedCreateJobPosting.mockResolvedValueOnce(createdJobPosting);

    const { result } = renderHook(() => useCreateJobPosting(), {
      wrapper: createWrapperWithClient(client),
    });

    result.current.mutate(payload);

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["job-postings", "list"],
      });
    });
  });
});
