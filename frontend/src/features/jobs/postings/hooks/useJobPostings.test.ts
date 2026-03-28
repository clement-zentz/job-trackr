// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/hooks/useJobPostings.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useJobPostings } from "./useJobPostings";
import * as api from "../api/listJobPostings";
import { createWrapper } from "@/tests/utils";

describe("useJobPostings", () => {
  it("returns data on success", async () => {
    const mockData = [
      {
        id: "myid123",
        title: "Backend Engineer",
        company: "Acme",
        location: "Paris",
        platform: "linkedin",
        raw_url: "https://example.com/123",
        canonical_url: "https://example.com/123",
        posted_at: "2025-01-01T10:00:00Z",
      },
    ];

    vi.spyOn(api, "listJobPostings").mockResolvedValue(mockData);

    const { result } = renderHook(() => useJobPostings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });

  it("handles error state", async () => {
    vi.spyOn(api, "listJobPostings").mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useJobPostings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
