// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/utils.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function renderWithQueryClient(ui: ReactElement) {
  const client = createTestQueryClient();

  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

export function createWrapper() {
  const client = createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
