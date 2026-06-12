// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/utils.test.ts

import { describe, expect, it } from "vitest";
import { formatDateTimeForDisplay, formatUrlForDisplay } from "../utils";

describe("formatDateTimeForDisplay", () => {
  it("formats a valid ISO datetime for display", () => {
    const result = formatDateTimeForDisplay("2026-06-10T08:30:00Z", {
      locale: "en-US",
      timeZone: "UTC",
    });

    expect(result).toBe("Jun 10, 2026, 08:30 AM");
  });

  it("formats a datetime using the provided locale", () => {
    const result = formatDateTimeForDisplay("2026-06-10T08:30:00Z", {
      locale: "fr-FR",
      timeZone: "UTC",
    });

    expect(result).toBe("10 juin 2026, 08:30");
  });

  it("formats a datetime using the provided timezone", () => {
    const result = formatDateTimeForDisplay("2026-06-10T08:30:00Z", {
      locale: "en-US",
      timeZone: "Europe/Paris",
    });

    expect(result).toBe("Jun 10, 2026, 10:30 AM");
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
