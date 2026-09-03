// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/cache.ts

import type { QueryClient } from "@tanstack/react-query";

import { authKeys } from "./keys";

export function removeNonAuthQueries(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.all[0],
  });
}
