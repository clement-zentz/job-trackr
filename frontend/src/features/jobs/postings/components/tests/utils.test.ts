// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/utils.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDateTimeForDisplay, formatUrlForDisplay } from "../utils";

describe("formatDateTimeForDisplay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const expectedDateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const;

  function mockToLocaleString(returnValue = "Formatted date") {
    return vi
      .spyOn(Date.prototype, "toLocaleString")
      .mockReturnValue(returnValue);
  }

  it("returns the formatted datetime from toLocaleString", () => {
    const toLocaleStringSpy = mockToLocaleString();

    const result = formatDateTimeForDisplay("2026-06-10T08:30:00Z");

    expect(result).toBe("Formatted date");
    expect(toLocaleStringSpy).toHaveBeenCalledWith(undefined, {
      ...expectedDateTimeFormatOptions,
      timeZone: undefined,
    });
  });

  it("passes the provided locale to toLocaleString", () => {
    const toLocaleStringSpy = mockToLocaleString();

    formatDateTimeForDisplay("2026-06-10T08:30:00Z", {
      locale: "fr-FR",
    });

    expect(toLocaleStringSpy).toHaveBeenCalledWith("fr-FR", {
      ...expectedDateTimeFormatOptions,
      timeZone: undefined,
    });
  });

  it("passes the provided timezone to toLocaleString", () => {
    const toLocaleStringSpy = mockToLocaleString();

    formatDateTimeForDisplay("2026-06-10T08:30:00Z", {
      timeZone: "Europe/Paris",
    });

    expect(toLocaleStringSpy).toHaveBeenCalledWith(undefined, {
      ...expectedDateTimeFormatOptions,
      timeZone: "Europe/Paris",
    });
  });

  it("returns the original value when the datetime is invalid", () => {
    expect(formatDateTimeForDisplay("not-a-date")).toBe("not-a-date");
  });
});

describe("formatUrlForDisplay", () => {
  it("removes the http protocol", () => {
    expect(formatUrlForDisplay("http://example.com")).toBe("example.com");
  });

  it("removes the https protocol", () => {
    expect(formatUrlForDisplay("https://example.com")).toBe("example.com");
  });

  it("removes www from the beginning of the URL", () => {
    expect(formatUrlForDisplay("https://www.example.com")).toBe("example.com");
  });

  it("trims surrounding whitespace", () => {
    expect(formatUrlForDisplay("  https://www.example.com  ")).toBe(
      "example.com",
    );
  });

  it("removes a trailing slash", () => {
    expect(formatUrlForDisplay("https://www.example.com/")).toBe("example.com");
  });

  it("does not remove slashes inside the URL", () => {
    expect(formatUrlForDisplay("https://www.example.com/jobs/123", 20)).toBe(
      "example.com/jobs/123",
    );
  });

  it("truncates URLs longer than the max length", () => {
    expect(
      formatUrlForDisplay("https://www.example.com/jobs/software-engineer", 20),
    ).toBe("example.com/jobs/sof…");
  });

  it("does not truncate URLs equal to the max length", () => {
    expect(formatUrlForDisplay("https://www.example.com", 11)).toBe(
      "example.com",
    );
  });

  it("does not truncate URLs shorter than the max length", () => {
    expect(formatUrlForDisplay("https://www.example.com", 60)).toBe(
      "example.com",
    );
  });
});
