// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/account.ts

import type {
  UserAccountRead,
  UserAccountUpdatePayload,
} from "@/features/account/types";

export function createUserAccountRead(
  overrides: Partial<UserAccountRead> = {},
): UserAccountRead {
  return {
    id: 1,
    username: "john.doe",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    date_joined: "2026-01-01T10:00:00Z",
    ...overrides,
  } satisfies UserAccountRead;
}

export function createUserAccountUpdatePayload(
  overrides: UserAccountUpdatePayload = {},
): UserAccountUpdatePayload {
  return {
    username: "updated.username",
    first_name: "Updated",
    last_name: "User",
    ...overrides,
  } satisfies UserAccountUpdatePayload;
}
