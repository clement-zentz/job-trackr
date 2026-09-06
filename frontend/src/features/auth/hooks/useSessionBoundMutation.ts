// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useSessionBoundMutation.ts

import type { MutateOptions, UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

import {
  registerSessionBoundMutation,
  subscribeToAuthGeneration,
} from "../cache";

type Callbacks<TData, TVariables> = Pick<
  UseMutationOptions<TData, Error, TVariables>,
  "onSuccess" | "onError" | "onSettled"
>;

interface MutationVariables<TVariables> {
  variables: TVariables;
  registration: ReturnType<typeof registerSessionBoundMutation>;
}

function guardCallbacks<TData, TVariables>(
  callbacks: Callbacks<TData, TVariables>,
): Callbacks<TData, MutationVariables<TVariables>> {
  return {
    onSuccess: (data, { variables, registration }, result, context) => {
      if (registration.isCurrent()) {
        return callbacks.onSuccess?.(data, variables, result, context);
      }
    },
    onError: (error, { variables, registration }, result, context) => {
      if (registration.isCurrent()) {
        return callbacks.onError?.(error, variables, result, context);
      }
    },
    onSettled: (data, error, { variables, registration }, result, context) => {
      if (registration.isCurrent()) {
        return callbacks.onSettled?.(data, error, variables, result, context);
      }
    },
  };
}

/**
 * Session-bound mutations for protected application data.
 * Only mutationFn and guarded onSuccess/onError/onSettled callbacks are exposed;
 * onMutate, mutation keys and per-hook retry options need separate isolation
 * guarantees before being added. QueryClient defaults still apply.
 * mutateAsync keeps normal promise semantics; use the guarded callbacks for
 * session-dependent side effects.
 */
export function useSessionBoundMutation<TData, TVariables>(
  options: Callbacks<TData, TVariables> & {
    mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>;
  },
) {
  const queryClient = useQueryClient();
  const callbacks = guardCallbacks(options);
  const mutation = useMutation({
    mutationFn: ({
      variables,
      registration,
    }: MutationVariables<TVariables>) => {
      // Paused mutations and retries must keep their original session, too.
      registration.signal.throwIfAborted();
      return options.mutationFn(variables, registration.signal);
    },
    ...callbacks,
    onSettled: async (data, error, variables, result, context) => {
      try {
        await callbacks.onSettled?.(data, error, variables, result, context);
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
      mutateOptions?: MutateOptions<TData, Error, TVariables>,
    ) =>
      mutation.mutate(prepare(variables), guardCallbacks(mutateOptions ?? {})),
    mutateAsync: (
      variables: TVariables,
      mutateOptions?: MutateOptions<TData, Error, TVariables>,
    ) =>
      mutation.mutateAsync(
        prepare(variables),
        guardCallbacks(mutateOptions ?? {}),
      ),
  };
}
