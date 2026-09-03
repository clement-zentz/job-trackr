// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/api/tests/authApi.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/api/client";
import {
  createAuthenticatedAuthResponse,
  createLoginPayload,
  createResetPasswordPayload,
  createSignupPayload,
  createUnauthenticatedAuthResponse,
} from "@/tests/factories/auth";

import {
  getCurrentSession,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  signup,
  verifyEmail,
} from "../authApi";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiDelete = vi.mocked(api.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentSession", () => {
  it("gets the current authentication session", async () => {
    const response = createAuthenticatedAuthResponse();

    mockedApiGet.mockResolvedValueOnce({
      data: response,
    });

    const result = await getCurrentSession();

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/session",
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("accepts both 200 and 401 authentication statuses", async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: createUnauthenticatedAuthResponse(),
    });

    await getCurrentSession();

    const config = mockedApiGet.mock.calls[0][1];

    expect(config?.validateStatus?.(200)).toBe(true);
    expect(config?.validateStatus?.(401)).toBe(true);
    expect(config?.validateStatus?.(400)).toBe(false);
    expect(config?.validateStatus?.(500)).toBe(false);
  });

  it("propagates an API error", async () => {
    const error = new Error("Failed to get authentication session");

    mockedApiGet.mockRejectedValueOnce(error);

    await expect(getCurrentSession()).rejects.toBe(error);
  });

  it("forwards the abort signal when getting the current session", async () => {
    const controller = new AbortController();
    const response = createAuthenticatedAuthResponse();

    mockedApiGet.mockResolvedValueOnce({
      data: response,
    });

    await getCurrentSession(controller.signal);

    expect(mockedApiGet).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/session",
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });
});

describe("login", () => {
  it("posts the credentials to the login endpoint", async () => {
    const payload = createLoginPayload();
    const response = createAuthenticatedAuthResponse();

    mockedApiPost.mockResolvedValueOnce({
      data: response,
    });

    const result = await login(payload);

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/login",
      payload,
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("propagates an API error", async () => {
    const payload = createLoginPayload();
    const error = new Error("Failed to log in");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(login(payload)).rejects.toBe(error);
  });
});

describe("signup", () => {
  it("posts the user data to the signup endpoint", async () => {
    const payload = createSignupPayload();
    const response = createAuthenticatedAuthResponse();

    mockedApiPost.mockResolvedValueOnce({
      data: response,
    });

    const result = await signup(payload);

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/signup",
      payload,
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("propagates an API error", async () => {
    const payload = createSignupPayload();
    const error = new Error("Failed to sign up");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(signup(payload)).rejects.toBe(error);
  });
});

describe("verifyEmail", () => {
  it("posts the verification key to the email verification endpoint", async () => {
    const response = createAuthenticatedAuthResponse();

    mockedApiPost.mockResolvedValueOnce({
      data: response,
    });

    const result = await verifyEmail("verification-key");

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/email/verify",
      {
        key: "verification-key",
      },
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("propagates an API error", async () => {
    const error = new Error("Failed to verify email");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(verifyEmail("verification-key")).rejects.toBe(error);
  });
});

describe("requestPasswordReset", () => {
  it("posts the email to the password reset request endpoint", async () => {
    mockedApiPost.mockResolvedValueOnce({
      data: undefined,
    });

    await expect(
      requestPasswordReset("test@example.com"),
    ).resolves.toBeUndefined();

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/password/request",
      {
        email: "test@example.com",
      },
    );
  });

  it("propagates an API error", async () => {
    const error = new Error("Failed to request password reset");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(requestPasswordReset("test@example.com")).rejects.toBe(error);
  });
});

describe("resetPassword", () => {
  it("posts the new password to the password reset endpoint", async () => {
    const payload = createResetPasswordPayload();
    const response = createAuthenticatedAuthResponse();

    mockedApiPost.mockResolvedValueOnce({
      data: response,
    });

    const result = await resetPassword(payload);

    expect(mockedApiPost).toHaveBeenCalledOnce();
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/password/reset",
      payload,
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("propagates an API error", async () => {
    const payload = createResetPasswordPayload();
    const error = new Error("Failed to reset password");

    mockedApiPost.mockRejectedValueOnce(error);

    await expect(resetPassword(payload)).rejects.toBe(error);
  });
});

describe("logout", () => {
  it("deletes the current authentication session", async () => {
    const response = createUnauthenticatedAuthResponse();

    mockedApiDelete.mockResolvedValueOnce({
      data: response,
    });

    const result = await logout();

    expect(mockedApiDelete).toHaveBeenCalledOnce();
    expect(mockedApiDelete).toHaveBeenCalledWith(
      "/_allauth/browser/v1/auth/session",
      {
        validateStatus: expect.any(Function),
      },
    );
    expect(result).toEqual(response);
  });

  it("propagates an API error", async () => {
    const error = new Error("Failed to log out");

    mockedApiDelete.mockRejectedValueOnce(error);

    await expect(logout()).rejects.toBe(error);
  });
});
