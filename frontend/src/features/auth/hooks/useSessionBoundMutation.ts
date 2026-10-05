// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useSessionBoundMutation.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

import {
  registerSessionBoundMutation,
  type SessionBoundMutationContext,
  subscribeToAuthGeneration,
} from "../cache";

interface SessionBoundCallbacks<TData, TVariables, TCallbackResult = unknown> {
  onSuccess?: (
    data: TData,
    variables: TVariables,
    session: SessionBoundMutationContext,
  ) => TCallbackResult;

  onError?: (
    error: Error,
    variables: TVariables,
    session: SessionBoundMutationContext,
  ) => TCallbackResult;

  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
    session: SessionBoundMutationContext,
  ) => TCallbackResult;
}

type SessionBoundMutationOptions<TData, TVariables> = SessionBoundCallbacks<
  TData,
  TVariables
> & {
  mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>;
};

type SessionBoundMutateOptions<TData, TVariables> = SessionBoundCallbacks<
  TData,
  TVariables,
  void
>;

interface MutationVariables<TVariables> {
  variables: TVariables;
  registration: ReturnType<typeof registerSessionBoundMutation>;
}

function guardCallbacks<TData, TVariables, TCallbackResult>(
  callbacks: SessionBoundCallbacks<TData, TVariables, TCallbackResult>,
) {
  return {
    onSuccess: (
      data: TData,
      { variables, registration }: MutationVariables<TVariables>,
    ) => {
      if (!registration.isCurrent()) {
        return;
      }

      return callbacks.onSuccess?.(data, variables, registration);
    },

    onError: (
      error: Error,
      { variables, registration }: MutationVariables<TVariables>,
    ) => {
      if (!registration.isCurrent()) {
        return;
      }

      return callbacks.onError?.(error, variables, registration);
    },

    onSettled: (
      data: TData | undefined,
      error: Error | null,
      { variables, registration }: MutationVariables<TVariables>,
    ) => {
      if (!registration.isCurrent()) {
        return;
      }

      return callbacks.onSettled?.(data, error, variables, registration);
    },
  };
}

/**
 * Session-bound mutations for protected application data.
 *
 * Callbacks are prevented from starting after their captured auth generation
 * becomes stale. Async callbacks also receive their session context so they can
 * recheck session.isCurrent() after their own await boundaries.
 *
 * onMutate, mutation keys and per-hook retry options need separate isolation
 * guarantees before being added. QueryClient defaults still apply.
 *
 * mutateAsync keeps normal promise semantics; use guarded callbacks for
 * session-dependent side effects.
 */
export function useSessionBoundMutation<TData, TVariables>(
  options: SessionBoundMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();

  const callbacks = guardCallbacks<TData, TVariables, unknown>(options);

  const mutation = useMutation<TData, Error, MutationVariables<TVariables>>({
    mutationFn: ({ variables, registration }) => {
      // Paused mutations and retries must keep their original session, too.
      registration.signal.throwIfAborted();

      return options.mutationFn(variables, registration.signal);
    },

    ...callbacks,

    onSettled: async (data, error, variables) => {
      try {
        await callbacks.onSettled?.(data, error, variables);
      } finally {
        variables.registration.release();
      }
    },
  });

  const { reset } = mutation;

  useLayoutEffect(
    () => subscribeToAuthGeneration(queryClient, reset),
    [queryClient, reset],
  );

  // Capture per invocation, before TanStack Query can pause or await anything.
  // Keeping this in variables also isolates concurrent calls on the same hook.
  const prepare = (variables: TVariables) => ({
    variables,
    registration: registerSessionBoundMutation(queryClient),
  });

  return {
    ...mutation,

    variables: mutation.variables?.variables,

    mutate: (
      variables: TVariables,
      mutateOptions?: SessionBoundMutateOptions<TData, TVariables>,
    ) =>
      mutation.mutate(
        prepare(variables),
        guardCallbacks<TData, TVariables, void>(mutateOptions ?? {}),
      ),

    mutateAsync: (
      variables: TVariables,
      mutateOptions?: SessionBoundMutateOptions<TData, TVariables>,
    ) =>
      mutation.mutateAsync(
        prepare(variables),
        guardCallbacks<TData, TVariables, void>(mutateOptions ?? {}),
      ),
  };
}
