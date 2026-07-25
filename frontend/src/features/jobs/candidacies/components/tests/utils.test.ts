// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/utils.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDateOnly } from "../utils";

describe("formatDateOnly", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats the date using toLocaleDateString", () => {
    const toLocaleDateStringSpy = vi
      .spyOn(Date.prototype, "toLocaleDateString")
      .mockReturnValue("Jul 20, 2026");

    const result = formatDateOnly("2026-07-20");

    expect(result).toBe("Jul 20, 2026");

    expect(toLocaleDateStringSpy).toHaveBeenCalledWith(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const formattedDate = toLocaleDateStringSpy.mock.instances[0] as Date;

    expect(formattedDate).toBeInstanceOf(Date);
    expect(formattedDate.getFullYear()).toBe(2026);
    expect(formattedDate.getMonth()).toBe(6);
    expect(formattedDate.getDate()).toBe(20);
  });

  it.each([
    "",
    "not-a-date",
    "2026-07",
    "2026-00-20",
    "2026-13-20",
    "2026-02-30",
    "2026-07-00",
  ])("returns the original value when %j cannot be parsed", (value) => {
    const toLocaleDateStringSpy = vi.spyOn(
      Date.prototype,
      "toLocaleDateString",
    );

    expect(formatDateOnly(value)).toBe(value);
    expect(toLocaleDateStringSpy).not.toHaveBeenCalled();
  });
});
