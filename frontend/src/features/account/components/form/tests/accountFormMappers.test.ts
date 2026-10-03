// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/tests/accountFormMappers.test.ts

import { describe, expect, it } from "vitest";

import type { UserAccountFormValues } from "@/features/account/types";
import { createUserAccountRead } from "@/tests/factories/account";

import {
  formValuesToUpdatePayload,
  userAccountToFormValues,
} from "../accountFormMappers";

describe("userAccountToFormValues", () => {
  it("maps a user account response to form values", () => {
    const account = createUserAccountRead({
      username: "jane.doe",
      first_name: "Jane",
      last_name: "Doe",
    });

    expect(userAccountToFormValues(account)).toEqual({
      username: "jane.doe",
      first_name: "Jane",
      last_name: "Doe",
    });
  });
});

describe("formValuesToUpdatePayload", () => {
  it("returns an empty payload when no values changed", () => {
    const account = createUserAccountRead();

    const formValues = {
      username: account.username,
      first_name: account.first_name,
      last_name: account.last_name,
    } satisfies UserAccountFormValues;

    expect(formValuesToUpdatePayload(account, formValues)).toEqual({});
  });

  it("includes changed values in the update payload", () => {
    const account = createUserAccountRead();

    const formValues = {
      username: "jane.doe",
      first_name: "Jane",
      last_name: "Smith",
    } satisfies UserAccountFormValues;

    expect(formValuesToUpdatePayload(account, formValues)).toEqual({
      username: "jane.doe",
      first_name: "Jane",
      last_name: "Smith",
    });
  });

  it("includes only values that changed", () => {
    const account = createUserAccountRead();

    const formValues = {
      username: account.username,
      first_name: "Jane",
      last_name: account.last_name,
    } satisfies UserAccountFormValues;

    expect(formValuesToUpdatePayload(account, formValues)).toEqual({
      first_name: "Jane",
    });
  });

  it("keeps empty strings so name fields can be cleared", () => {
    const account = createUserAccountRead();

    const formValues = {
      username: account.username,
      first_name: "",
      last_name: "",
    } satisfies UserAccountFormValues;

    expect(formValuesToUpdatePayload(account, formValues)).toEqual({
      first_name: "",
      last_name: "",
    });
  });
});
