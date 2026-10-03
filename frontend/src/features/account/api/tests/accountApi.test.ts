// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/api/tests/accountApi.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import {
  createUserAccountRead,
  createUserAccountUpdatePayload,
} from "@/tests/factories/account";

import { getUserAccount, updateUserAccount } from "../accountApi";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPatch = vi.mocked(api.patch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserAccount", () => {
  it.each([false, true])(
    "gets the current user account (signal: %s)",
    async (withSignal) => {
      const signal = withSignal ? new AbortController().signal : undefined;
      const account = createUserAccountRead();

      mockedApiGet.mockResolvedValueOnce({
        data: account,
      });

      const result = await getUserAccount(signal);

      expect(mockedApiGet).toHaveBeenCalledOnce();
      expect(mockedApiGet).toHaveBeenCalledWith("/v1/account/", {
        signal,
      });
      expect(result).toEqual(account);
    },
  );

  it("propagates an API error", async () => {
    const error = new Error("Failed to get user account");

    mockedApiGet.mockRejectedValueOnce(error);

    await expect(getUserAccount()).rejects.toBe(error);

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith("/v1/account/", {
      signal: undefined,
    });
  });
});

describe("updateUserAccount", () => {
  it.each([false, true])(
    "patches the current user account (signal: %s)",
    async (withSignal) => {
      const signal = withSignal ? new AbortController().signal : undefined;
      const payload = createUserAccountUpdatePayload();
      const account = createUserAccountRead({
        username: payload.username,
        first_name: payload.first_name,
        last_name: payload.last_name,
      });

      mockedApiPatch.mockResolvedValueOnce({
        data: account,
      });

      const result = await updateUserAccount(payload, signal);

      expect(mockedApiPatch).toHaveBeenCalledOnce();
      expect(mockedApiPatch).toHaveBeenCalledWith("/v1/account/", payload, {
        signal,
      });
      expect(result).toEqual(account);
    },
  );

  it("propagates an API error", async () => {
    const payload = createUserAccountUpdatePayload({
      username: "new.username",
    });
    const error = new Error("Failed to update user account");

    mockedApiPatch.mockRejectedValueOnce(error);

    await expect(updateUserAccount(payload)).rejects.toBe(error);

    expect(mockedApiPatch).toHaveBeenCalledOnce();
    expect(mockedApiPatch).toHaveBeenCalledWith("/v1/account/", payload, {
      signal: undefined,
    });
  });
});
