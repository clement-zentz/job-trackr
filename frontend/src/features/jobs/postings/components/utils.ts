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
