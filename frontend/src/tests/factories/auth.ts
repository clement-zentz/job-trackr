// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/auth.ts

import type {
  AuthFlow,
  AuthResponse,
  AuthUser,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
} from "@/features/auth/types";

type AuthResponseOverrides = Omit<Partial<AuthResponse>, "data" | "meta"> & {
  data?: Partial<AuthResponse["data"]>;
  meta?: Partial<AuthResponse["meta"]>;
};

export function createAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    display: "testuser",
    username: "testuser",
    email: "test@example.com",
    has_usable_password: true,
    ...overrides,
  } satisfies AuthUser;
}

export function createAuthFlow(overrides: Partial<AuthFlow> = {}): AuthFlow {
  return {
    id: "login",
    ...overrides,
  } satisfies AuthFlow;
}

export function createAuthenticatedAuthResponse(
  overrides: AuthResponseOverrides = {},
): AuthResponse {
  const {
    data: dataOverrides,
    meta: metaOverrides,
    ...responseOverrides
  } = overrides;

  return {
    status: 200,
    data: {
      user: createAuthUser(),
      ...dataOverrides,
    },
    meta: {
      is_authenticated: true,
      ...metaOverrides,
    },
    ...responseOverrides,
  } satisfies AuthResponse;
}

export function createUnauthenticatedAuthResponse(
  overrides: AuthResponseOverrides = {},
): AuthResponse {
  const {
    data: dataOverrides,
    meta: metaOverrides,
    ...responseOverrides
  } = overrides;

  return {
    status: 401,
    data: {
      ...dataOverrides,
    },
    meta: {
      is_authenticated: false,
      ...metaOverrides,
    },
    ...responseOverrides,
  } satisfies AuthResponse;
}

export function createLoginPayload(
  overrides: Partial<LoginPayload> = {},
): LoginPayload {
  return {
    username: "testuser",
    password: "password",
    ...overrides,
  } satisfies LoginPayload;
}

export function createSignupPayload(
  overrides: Partial<SignupPayload> = {},
): SignupPayload {
  return {
    username: "testuser",
    email: "test@example.com",
    password: "password",
    ...overrides,
  } satisfies SignupPayload;
}

export function createResetPasswordPayload(
  overrides: Partial<ResetPasswordPayload> = {},
): ResetPasswordPayload {
  return {
    key: "password-reset-key",
    password: "new-password",
    ...overrides,
  } satisfies ResetPasswordPayload;
}
