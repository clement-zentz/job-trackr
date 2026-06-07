// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/utils.ts

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUrlForDisplay(url: string, maxLength = 60): string {
  return url.length > maxLength ? `${url.slice(0, maxLength)}…` : url;
}
