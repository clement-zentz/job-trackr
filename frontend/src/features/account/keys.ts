// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/keys.ts

export const accountKeys = {
  all: ["account"] as const,
  detail: () => [...accountKeys.all, "detail"] as const,
};
