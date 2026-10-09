// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/errors.ts

import axios from "axios";

import type { AuthErrorResponse } from "@/features/auth/types";

import type { UserAccountUpdatePayload } from "./types";

type AccountErrorData = Partial<
  Record<keyof UserAccountUpdatePayload, string[]>
>;

const fieldLabels: Record<keyof UserAccountUpdatePayload, string> = {
  username: "Username",
  first_name: "First name",
  last_name: "Last name",
};

export function getAccountUpdateErrorMessage(error: Error | null) {
  if (!error) {
    return undefined;
  }

  if (axios.isAxiosError<AccountErrorData>(error)) {
    const data = error.response?.data;

    if (data) {
      for (const field of ["username", "first_name", "last_name"] as const) {
        const message = data[field]?.[0];

        if (message) {
          return `${fieldLabels[field]}: ${message}`;
        }
      }
    }
  }

  return "Could not update account.";
}

export function getEmailChangeErrorMessage(error: Error | null) {
  if (!error) {
    return undefined;
  }

  if (axios.isAxiosError<AuthErrorResponse>(error)) {
    const message = error.response?.data?.errors?.[0]?.message;

    if (message) {
      return message;
    }
  }

  return "Could not change email address.";
}
