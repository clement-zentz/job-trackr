// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/utils.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithQueryClient(ui: ReactElement) {
  const client = createTestQueryClient();

  const renderResult = render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );

  return {
    ...renderResult,
    queryClient: client,
  };
}

export function createWrapper() {
  const client = createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

export function createWrapperWithClient(
  client: ReturnType<typeof createTestQueryClient>,
) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

export function createDeferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};

  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}
