// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/api/accountApi.ts

import { api } from "@/api/client";

import type { UserAccountRead, UserAccountUpdatePayload } from "../types";

const ACCOUNT_ENDPOINT = "/v1/account/";

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
