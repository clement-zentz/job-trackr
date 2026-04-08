// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/types/pagination.ts

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
