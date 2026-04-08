// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/factories/paginatedResponse.ts

import type { PaginatedResponse } from "@/types/pagination";

export function createPaginatedResponse<T>(
  results: T[],
  overrides: Partial<PaginatedResponse<T>> = {},
): PaginatedResponse<T> {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
    ...overrides,
  };
}
