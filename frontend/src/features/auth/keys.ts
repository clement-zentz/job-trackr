// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/keys.ts

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
