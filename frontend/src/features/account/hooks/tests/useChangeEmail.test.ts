// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/tests/useChangeEmail.test.ts

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSessionBoundState } from "@/features/auth/cache";
import { createTestQueryClient, createWrapperWithClient } from "@/tests/utils";

import {
  requestEmailChange,
  resendEmailVerification,
} from "../../api/accountApi";
import { useChangeEmail } from "../useChangeEmail";

vi.mock("../../api/accountApi", () => ({
  requestEmailChange: vi.fn(),
  resendEmailVerification: vi.fn(),
}));

const mockedRequestEmailChange = vi.mocked(requestEmailChange);
const mockedResendEmailVerification = vi.mocked(resendEmailVerification);

describe("useChangeEmail", () => {
  beforeEach(() => {
    mockedRequestEmailChange.mockReset();
    mockedResendEmailVerification.mockReset();
  });

  it.each(["change", "resend"] as const)(
    "routes the %s action to the correct API function",
    async (action) => {
      const queryClient = createTestQueryClient();
      const email = "new.email@example.com";

      const expectedApi =
        action === "change"
          ? mockedRequestEmailChange
          : mockedResendEmailVerification;

      const otherApi =
        action === "change"
          ? mockedResendEmailVerification
          : mockedRequestEmailChange;

      expectedApi.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useChangeEmail(), {
        wrapper: createWrapperWithClient(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ email, action });
      });

      expect(expectedApi).toHaveBeenCalledExactlyOnceWith(
        email,
        expect.any(AbortSignal),
      );

      expect(otherApi).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.variables).toEqual({
        email,
        action,
      });
    },
  );

  it.each(["change", "resend"] as const)(
    "exposes an error when the %s request fails",
    async (action) => {
      const queryClient = createTestQueryClient();
      const error = new Error("Email verification request failed");

      const expectedApi =
        action === "change"
          ? mockedRequestEmailChange
          : mockedResendEmailVerification;

      expectedApi.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useChangeEmail(), {
        wrapper: createWrapperWithClient(queryClient),
      });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            email: "new.email@example.com",
            action,
          }),
        ).rejects.toBe(error);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(error);
      });
    },
  );

  it.each(["change", "resend"] as const)(
    "aborts an in-flight %s request when the session resets",
    async (action) => {
      const queryClient = createTestQueryClient();
      const email = "new.email@example.com";

      const mockedApi =
        action === "change"
          ? mockedRequestEmailChange
          : mockedResendEmailVerification;

      mockedApi.mockImplementationOnce(
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
          .mutateAsync({ email, action })
          .catch((error: unknown) => error);
      });

      await waitFor(() => {
        expect(mockedApi).toHaveBeenCalledOnce();
      });

      const signal = mockedApi.mock.lastCall?.[1];

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
    },
  );
});
