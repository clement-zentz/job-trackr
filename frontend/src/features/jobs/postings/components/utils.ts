// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/utils.ts

export function formatDateTimeForDisplay(
  dateString: string,
  options: {
    locale?: string;
    timeZone?: string;
  } = {},
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString(options.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: options.timeZone,
  });
}

export function formatDateForDisplay(
  dateString: string,
  options: {
    locale?: string;
    timeZone?: string;
  } = {},
): string {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (isoDatePattern.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.toLocaleDateString(options.locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(options.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: options.timeZone,
  });
}

export function formatUrlForDisplay(url: string, maxLength = 60): string {
  const displayUrl = url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

  return displayUrl.length > maxLength
    ? `${displayUrl.slice(0, maxLength)}…`
    : displayUrl;
}
