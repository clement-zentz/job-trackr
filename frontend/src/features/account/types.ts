// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/types.ts

export interface UserAccountRead {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface UserAccountUpdatePayload {
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserAccountFormValues {
  username: string;
  first_name: string;
  last_name: string;
}
