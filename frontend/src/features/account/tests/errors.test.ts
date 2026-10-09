// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/tests/errors.test.ts

import { describe, expect, it } from "vitest";

import {
  getAccountUpdateErrorMessage,
  getEmailChangeErrorMessage,
} from "../errors";

function createAxiosError(data?: unknown): Error {
  return Object.assign(new Error("Request failed"), {
    isAxiosError: true,
    response: data === undefined ? undefined : { data },
  });
}

describe("getAccountUpdateErrorMessage", () => {
  it("returns undefined when there is no error", () => {
    expect(getAccountUpdateErrorMessage(null)).toBeUndefined();
  });

  it.each([
    ["username", "Username"],
    ["first_name", "First name"],
    ["last_name", "Last name"],
  ])("maps the %s field error", (field, label) => {
    const error = createAxiosError({
      [field]: ["This value is invalid."],
    });

    expect(getAccountUpdateErrorMessage(error)).toBe(
      `${label}: This value is invalid.`,
    );
  });

  it("returns the first field error in priority order", () => {
    const error = createAxiosError({
      last_name: ["Invalid last name."],
      first_name: ["Invalid first name."],
      username: ["Invalid username."],
    });

    expect(getAccountUpdateErrorMessage(error)).toBe(
      "Username: Invalid username.",
    );
  });

  it("skips empty field messages", () => {
    const error = createAxiosError({
      username: [""],
      first_name: ["Invalid first name."],
    });

    expect(getAccountUpdateErrorMessage(error)).toBe(
      "First name: Invalid first name.",
    );
  });

  it.each([
    ["missing response", undefined],
    ["empty response data", {}],
    ["empty field errors", { username: [] }],
    ["empty field message", { username: [""] }],
    ["unrecognized fields", { detail: "Invalid request." }],
  ])("returns the fallback for %s", (_case, data) => {
    const error = createAxiosError(data);

    expect(getAccountUpdateErrorMessage(error)).toBe(
      "Could not update account.",
    );
  });

  it("returns the fallback for a non-Axios error", () => {
    expect(getAccountUpdateErrorMessage(new Error("Network error"))).toBe(
      "Could not update account.",
    );
  });
});

describe("getEmailChangeErrorMessage", () => {
  it("returns undefined when there is no error", () => {
    expect(getEmailChangeErrorMessage(null)).toBeUndefined();
  });

  it("returns the first API error message", () => {
    const error = createAxiosError({
      errors: [
        { message: "This email address is already in use." },
        { message: "Another error." },
      ],
    });

    expect(getEmailChangeErrorMessage(error)).toBe(
      "This email address is already in use.",
    );
  });

  it.each([
    ["missing response", undefined],
    ["null response data", null],
    ["empty response data", {}],
    ["missing errors", { detail: "Invalid request." }],
    ["empty errors array", { errors: [] }],
    ["missing message", { errors: [{}] }],
    ["empty message", { errors: [{ message: "" }] }],
  ])("returns the fallback for %s", (_case, data) => {
    const error = createAxiosError(data);

    expect(getEmailChangeErrorMessage(error)).toBe(
      "Could not change email address.",
    );
  });

  it("returns the fallback for a non-Axios error", () => {
    expect(getEmailChangeErrorMessage(new Error("Network error"))).toBe(
      "Could not change email address.",
    );
  });
});
