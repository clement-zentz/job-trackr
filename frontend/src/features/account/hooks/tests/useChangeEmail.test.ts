// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/tests/useChangeEmail.test.ts

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import { requestEmailChange } from "../../api/accountApi";
import { useChangeEmail } from "../useChangeEmail";

vi.mock("../../api/accountApi", () => ({
  requestEmailChange: vi.fn(),
}));

const mockedRequestEmailChange = vi.mocked(requestEmailChange);

describe("useChangeEmail", () => {
  beforeEach(() => {
    mockedRequestEmailChange.mockReset();
  });

  it("calls requestEmailChange with the email and abort signal", async () => {
    const queryClient = createTestQueryClient();
    const email = "new.email@example.com";

    mockedRequestEmailChange.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(email);
    });

    expect(mockedRequestEmailChange).toHaveBeenCalledOnce();
    expect(mockedRequestEmailChange).toHaveBeenCalledWith(
      email,
      expect.any(AbortSignal),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("exposes an error when the email change request fails", async () => {
    const queryClient = createTestQueryClient();
    const error = new Error("Email change request failed");

    mockedRequestEmailChange.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync("new.email@example.com"),
      ).rejects.toBe(error);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });
  });

  it("aborts an in-flight email change when the session resets", async () => {
    const queryClient = createTestQueryClient();
    const email = "new.email@example.com";

    mockedRequestEmailChange.mockImplementationOnce(
      (_email, signal) =>
        new Promise<never>((_resolve, reject) => {
          signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    let pending!: Promise<unknown>;

    act(() => {
      pending = result.current
        .mutateAsync(email)
        .catch((error: unknown) => error);
    });

    await waitFor(() => {
      expect(mockedRequestEmailChange).toHaveBeenCalledOnce();
    });

    const signal = mockedRequestEmailChange.mock.lastCall?.[1];

    expect(signal?.aborted).toBe(false);

    act(() => {
      resetSessionBoundState(queryClient);
    });

    expect(signal?.aborted).toBe(true);

    await act(async () => {
      expect(await pending).toMatchObject({
        name: "AbortError",
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });
  });
});
