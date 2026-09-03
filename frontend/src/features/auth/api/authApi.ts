// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/api/authApi.ts

import { api } from "@/api/client";

import type {
  AuthResponse,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
} from "../types";

const AUTH_ENDPOINT = "/_allauth/browser/v1/auth";

const acceptAuthenticationStatus = (status: number) =>
  status === 200 || status === 401;

export async function getCurrentSession(
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>(`${AUTH_ENDPOINT}/session`, {
    signal,
    validateStatus: acceptAuthenticationStatus,
  });

  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    `${AUTH_ENDPOINT}/login`,
    payload,
    {
      validateStatus: acceptAuthenticationStatus,
    },
  );

  return response.data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    `${AUTH_ENDPOINT}/signup`,
    payload,
    {
      validateStatus: acceptAuthenticationStatus,
    },
  );

  return response.data;
}

export async function verifyEmail(key: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    `${AUTH_ENDPOINT}/email/verify`,
    { key },
    {
      validateStatus: acceptAuthenticationStatus,
    },
  );

  return response.data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post(`${AUTH_ENDPOINT}/password/request`, { email });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    `${AUTH_ENDPOINT}/password/reset`,
    payload,
    {
      validateStatus: acceptAuthenticationStatus,
    },
  );

  return response.data;
}

export async function logout(): Promise<AuthResponse> {
  const response = await api.delete<AuthResponse>(`${AUTH_ENDPOINT}/session`, {
    validateStatus: acceptAuthenticationStatus,
  });

  return response.data;
}
