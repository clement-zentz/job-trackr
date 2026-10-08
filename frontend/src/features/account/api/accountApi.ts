// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/api/accountApi.ts

import { api } from "@/api/client";

import type { UserAccountRead, UserAccountUpdatePayload } from "../types";

const ACCOUNT_ENDPOINT = "/v1/account/";
const ALLAUTH_EMAIL_ENDPOINT = "/_allauth/browser/v1/account/email";

export async function getUserAccount(
  signal?: AbortSignal,
): Promise<UserAccountRead> {
  const response = await api.get<UserAccountRead>(ACCOUNT_ENDPOINT, {
    signal,
  });

  return response.data;
}

export async function updateUserAccount(
  payload: UserAccountUpdatePayload,
  signal?: AbortSignal,
): Promise<UserAccountRead> {
  const response = await api.patch<UserAccountRead>(ACCOUNT_ENDPOINT, payload, {
    signal,
  });

  return response.data;
}

export async function requestEmailChange(
  email: string,
  signal?: AbortSignal,
): Promise<void> {
  await api.post(ALLAUTH_EMAIL_ENDPOINT, { email }, { signal });
}
