// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/accountFormMappers.ts

import type {
  UserAccountFormValues,
  UserAccountRead,
  UserAccountUpdatePayload,
} from "../../types";

export function userAccountToFormValues(
  account: UserAccountRead,
): UserAccountFormValues {
  return {
    username: account.username,
    first_name: account.first_name,
    last_name: account.last_name,
  };
}

export function formValuesToUpdatePayload(
  account: UserAccountRead,
  formValues: UserAccountFormValues,
): UserAccountUpdatePayload {
  const payload: UserAccountUpdatePayload = {};

  if (formValues.username !== account.username) {
    payload.username = formValues.username;
  }

  if (formValues.first_name !== account.first_name) {
    payload.first_name = formValues.first_name;
  }

  if (formValues.last_name !== account.last_name) {
    payload.last_name = formValues.last_name;
  }

  return payload;
}
