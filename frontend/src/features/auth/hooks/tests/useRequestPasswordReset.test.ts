// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useRequestPasswordReset.test.ts

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWrapper } from "@/tests/utils";

import { requestPasswordReset } from "../../api/authApi";
import { useRequestPasswordReset } from "../useRequestPasswordReset";

vi.mock("../../api/authApi", () => ({
  requestPasswordReset: vi.fn(),
}));

const mockedRequestPasswordReset = vi.mocked(requestPasswordReset);

describe("useRequestPasswordReset", () => {
  beforeEach(() => {
    mockedRequestPasswordReset.mockReset();
  });

  it("calls requestPasswordReset with the email address", async () => {
    const email = "test@example.com";

    mockedRequestPasswordReset.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRequestPasswordReset(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync(email);

    expect(mockedRequestPasswordReset).toHaveBeenCalledOnce();
    expect(mockedRequestPasswordReset).toHaveBeenCalledWith(email);
  });

  it("exposes an error when the password reset request fails", async () => {
    mockedRequestPasswordReset.mockRejectedValueOnce(
      new Error("Password reset request failed"),
    );

    const { result } = renderHook(() => useRequestPasswordReset(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync("test@example.com"),
    ).rejects.toThrow("Password reset request failed");
  });
});
