// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/cache.ts

import type { QueryClient } from "@tanstack/react-query";

import { authKeys } from "./keys";
import type { AuthUser } from "./types";

interface SessionBoundState {
  generation: number;
  controllers: Set<AbortController>;
  listeners: Set<() => void>;
}

const sessionBoundStates = new WeakMap<QueryClient, SessionBoundState>();

function getSessionBoundState(queryClient: QueryClient) {
  let state = sessionBoundStates.get(queryClient);

  if (!state) {
    state = { generation: 0, controllers: new Set(), listeners: new Set() };
    sessionBoundStates.set(queryClient, state);
  }

  return state;
}

export function subscribeToAuthGeneration(
  queryClient: QueryClient,
  listener: () => void,
) {
  const state = getSessionBoundState(queryClient);
  state.listeners.add(listener);

  return () => {
    state.listeners.delete(listener);
  };
}

export function registerSessionBoundMutation(queryClient: QueryClient) {
  const state = getSessionBoundState(queryClient);
  const generation = state.generation;
  const controller = new AbortController();
  state.controllers.add(controller);

  return {
    signal: controller.signal,
    isCurrent: () => state.generation === generation,
    release: () => state.controllers.delete(controller),
  };
}

export function resetSessionBoundState(queryClient: QueryClient) {
  const state = getSessionBoundState(queryClient);

  // Invalidate callbacks before aborting: cancellation is only best effort.
  state.generation += 1;
  // Detach mutation observers before abort can settle their old requests.
  [...state.listeners].forEach((listener) => listener());
  const controllers = [...state.controllers];
  state.controllers.clear();
  controllers.forEach((controller) => controller.abort());

  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.all[0],
  });
}

export function subscribeToAuthSession(queryClient: QueryClient) {
  const sessionKey = authKeys.session();
  let previousUserId = queryClient.getQueryData<AuthUser | null>(
    sessionKey,
  )?.id;

  // Reset synchronously with session writes, before React renders the new user.
  return queryClient.getQueryCache().subscribe((event) => {
    const key = event.query.queryKey;
    if (
      key.length !== sessionKey.length ||
      key[0] !== sessionKey[0] ||
      key[1] !== sessionKey[1] ||
      (event.type !== "removed" &&
        !(event.type === "updated" && event.action.type === "success"))
    ) {
      return;
    }

    const user = event.query.state.data as AuthUser | null | undefined;
    const userId = event.type === "removed" ? undefined : user?.id;
    if (userId !== previousUserId) {
      previousUserId = userId;
      resetSessionBoundState(queryClient);
    }
  });
}
