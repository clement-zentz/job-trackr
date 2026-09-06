// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/tests/useSessionBoundMutation.test.ts

import { onlineManager } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createAuthUser } from "@/tests/factories/auth";
import {
  createDeferred,
  createTestQueryClient,
  createWrapperWithClient,
} from "@/tests/utils";

import { resetSessionBoundState, subscribeToAuthSession } from "../../cache";
import { authKeys } from "../../keys";
import { useSessionBoundMutation } from "../useSessionBoundMutation";

type TestMutationFn = (
  variables: string,
  signal: AbortSignal,
) => Promise<string>;

describe("useSessionBoundMutation", () => {
  it.each(["success", "error", "abort"])(
    "does not expose a late %s to a mounted consumer after an account switch",
    async (outcome) => {
      const client = createTestQueryClient();
      const userA = createAuthUser({ id: 1 });
      const userB = createAuthUser({ id: 2 });
      client.setQueryData(authKeys.session(), userA);
      const unsubscribe = subscribeToAuthSession(client);
      const deferred = createDeferred<string>();
      const error =
        outcome === "abort"
          ? new DOMException("Aborted", "AbortError")
          : new Error("User A request failed");
      const mutationFn = vi.fn<TestMutationFn>(() =>
        deferred.promise.then((data) => {
          if (outcome !== "success") throw error;
          return data;
        }),
      );
      const onRender = vi.fn();
      const { result, rerender } = renderHook(
        () => {
          const mutation = useSessionBoundMutation({ mutationFn });
          onRender(client.getQueryData(authKeys.session()), mutation);
          return mutation;
        },
        { wrapper: createWrapperWithClient(client) },
      );

      try {
        const pending = result.current
          .mutateAsync("user A variables")
          .catch((reason: unknown) => reason);
        await waitFor(() => expect(result.current.isPending).toBe(true));
        const signal = mutationFn.mock.calls[0][1];
        if (outcome === "abort") {
          signal.addEventListener("abort", () => deferred.resolve("ignored"));
        }

        act(() => {
          client.setQueryData(authKeys.session(), userB);
          rerender();
        });
        expect(result.current.status).toBe("idle");

        await act(async () => {
          // Even when cancellation loses the race, the observer must stay idle.
          deferred.resolve("user A result");
          await pending;
        });
        expect(signal.aborted).toBe(true);

        await waitFor(() => expect(result.current.status).toBe("idle"));
        const userBRenders = onRender.mock.calls.filter(
          ([user]) => user.id === userB.id,
        );
        expect(userBRenders.length).toBeGreaterThan(0);
        for (const [, mutation] of userBRenders) {
          expect(mutation).toMatchObject({
            data: undefined,
            error: null,
            variables: undefined,
            context: undefined,
            status: "idle",
            isIdle: true,
            isPending: false,
            isSuccess: false,
            isError: false,
            isPaused: false,
            failureCount: 0,
            failureReason: null,
            submittedAt: 0,
          });
        }
      } finally {
        unsubscribe();
      }
    },
  );

  it.each(["success", "error"])(
    "clears an already settled %s at the boundary without aborting its released controller",
    async (outcome) => {
      const client = createTestQueryClient();
      const mutationFn = vi.fn<TestMutationFn>(async () => {
        if (outcome === "error") throw new Error("User A failure");
        return "user A data";
      });
      const { result } = renderHook(
        () => useSessionBoundMutation({ mutationFn }),
        {
          wrapper: createWrapperWithClient(client),
        },
      );
      await act(async () => {
        await result.current
          .mutateAsync("user A variables")
          .catch(() => undefined);
      });
      await waitFor(() => expect(result.current.status).toBe(outcome));

      act(() => resetSessionBoundState(client));

      await waitFor(() => expect(result.current.status).toBe("idle"));
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.variables).toBeUndefined();
      expect(mutationFn.mock.calls[0][1].aborted).toBe(false);
    },
  );

  it.each(["before", "after"])(
    "isolates concurrent invocations when the old request finishes %s the new request",
    async (completionOrder) => {
      const client = createTestQueryClient();
      const first = createDeferred<string>();
      const second = createDeferred<string>();
      const mutationFn = vi
        .fn<TestMutationFn>()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
      const onSuccess = vi.fn((data: string) => {
        client.setQueryData(["jobs"], data);
      });
      const { result } = renderHook(
        () => useSessionBoundMutation({ mutationFn, onSuccess }),
        {
          wrapper: createWrapperWithClient(client),
        },
      );

      const oldMutation = result.current.mutateAsync("same job");
      await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(1));
      const oldSignal = mutationFn.mock.calls[0][1];
      resetSessionBoundState(client);
      const newMutation = result.current.mutateAsync("same job");
      await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(2));
      const newSignal = mutationFn.mock.calls[1][1];
      expect(newSignal).not.toBe(oldSignal);
      expect(oldSignal.aborted).toBe(true);
      expect(newSignal.aborted).toBe(false);

      if (completionOrder === "before") {
        await act(async () => {
          first.resolve("user A data");
          await oldMutation;
        });
        await waitFor(() => expect(result.current.isPending).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeNull();
      }

      await act(async () => {
        second.resolve("user B data");
        await newMutation;
        if (completionOrder === "after") {
          first.resolve("user A data");
          await oldMutation;
        }
      });

      expect(onSuccess).toHaveBeenCalledOnce();
      expect(client.getQueryData(["jobs"])).toBe("user B data");
      await waitFor(() => expect(result.current.data).toBe("user B data"));
      expect(result.current.variables).toBe("same job");
      resetSessionBoundState(client);
      expect(newSignal.aborted).toBe(false);
    },
  );

  it.each(["success", "error"])(
    "suppresses hook and per-call cache callbacks on a late %s",
    async (outcome) => {
      const client = createTestQueryClient();
      const deferred = createDeferred<string>();
      const error = new Error("Late failure");
      const mutationFn = vi.fn<TestMutationFn>(() =>
        deferred.promise.then((data) => {
          if (outcome === "error") throw error;
          return data;
        }),
      );
      const write = vi.fn(() => {
        client.setQueryData(["jobs"], "stale");
      });
      const hookCallbacks = {
        onSuccess: write,
        onError: write,
        onSettled: write,
      };
      const perCallWrite = vi.fn(write);
      const { result } = renderHook(
        () => useSessionBoundMutation({ mutationFn, ...hookCallbacks }),
        {
          wrapper: createWrapperWithClient(client),
        },
      );

      const pending = result.current
        .mutateAsync("job", {
          onSuccess: perCallWrite,
          onError: perCallWrite,
          onSettled: perCallWrite,
        })
        .catch((reason: unknown) => reason);
      await waitFor(() => expect(mutationFn).toHaveBeenCalledOnce());
      resetSessionBoundState(client);
      await act(async () => {
        deferred.resolve("user A data");
        expect(await pending).toBe(outcome === "error" ? error : "user A data");
      });

      expect(write).not.toHaveBeenCalled();
      expect(perCallWrite).not.toHaveBeenCalled();
      expect(client.getQueryData(["jobs"])).toBeUndefined();
    },
  );

  it.each(["success", "error"])(
    "releases the controller after a current %s",
    async (outcome) => {
      const client = createTestQueryClient();
      const error = new Error("Request failed");
      const mutationFn = vi.fn<TestMutationFn>(async () => {
        if (outcome === "error") throw error;
        return "data";
      });
      const onSettled = vi.fn();
      const perCallSettled = vi.fn();
      const { result } = renderHook(
        () => useSessionBoundMutation({ mutationFn, onSettled }),
        {
          wrapper: createWrapperWithClient(client),
        },
      );

      await act(async () => {
        await result.current
          .mutateAsync("job", { onSettled: perCallSettled })
          .catch(() => undefined);
      });
      expect(onSettled).toHaveBeenCalledOnce();
      expect(perCallSettled).toHaveBeenCalledOnce();
      resetSessionBoundState(client);
      expect(mutationFn.mock.calls[0][1].aborted).toBe(false);
    },
  );

  it("rechecks the generation for onSettled after awaiting onSuccess", async () => {
    const client = createTestQueryClient();
    const success = createDeferred<void>();
    const onSuccess = vi.fn(() => success.promise);
    const onSettled = vi.fn(() => client.setQueryData(["jobs"], "stale"));
    const { result } = renderHook(
      () =>
        useSessionBoundMutation({
          mutationFn: async () => "data",
          onSuccess,
          onSettled,
        }),
      { wrapper: createWrapperWithClient(client) },
    );

    const pending = result.current.mutateAsync("job");
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    resetSessionBoundState(client);
    await act(async () => {
      success.resolve();
      await pending;
    });
    expect(onSettled).not.toHaveBeenCalled();
    expect(client.getQueryData(["jobs"])).toBeUndefined();
  });

  it("captures the generation before the mutation function starts", async () => {
    const client = createTestQueryClient();
    const mutationFn = vi.fn<TestMutationFn>(async () => "data");
    const { result } = renderHook(
      () => useSessionBoundMutation({ mutationFn }),
      {
        wrapper: createWrapperWithClient(client),
      },
    );

    await act(async () => {
      const pending = result.current
        .mutateAsync("job")
        .catch((error: unknown) => error);
      resetSessionBoundState(client);
      expect(await pending).toMatchObject({ name: "AbortError" });
    });
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it("does not send a paused mutation under a later session", async () => {
    const client = createTestQueryClient();
    const mutationFn = vi.fn<TestMutationFn>(async () => "data");
    const { result } = renderHook(
      () => useSessionBoundMutation({ mutationFn }),
      {
        wrapper: createWrapperWithClient(client),
      },
    );

    onlineManager.setOnline(false);
    try {
      const pending = result.current
        .mutateAsync("job")
        .catch((error: unknown) => error);
      await waitFor(() => expect(result.current.isPaused).toBe(true));
      resetSessionBoundState(client);
      await act(async () => {
        onlineManager.setOnline(true);
        await client.resumePausedMutations();
        expect(await pending).toMatchObject({ name: "AbortError" });
      });
      expect(mutationFn).not.toHaveBeenCalled();
    } finally {
      onlineManager.setOnline(true);
    }
  });
});
