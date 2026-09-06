// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/tests/cache.test.ts

import { describe, expect, it, vi } from "vitest";

import { createAuthUser } from "@/tests/factories/auth";
import { createTestQueryClient } from "@/tests/utils";

import {
  registerSessionBoundMutation,
  resetSessionBoundState,
  subscribeToAuthSession,
} from "../cache";
import { authKeys } from "../keys";

describe("resetSessionBoundState", () => {
  it("removes non-auth queries while preserving auth queries", () => {
    const queryClient = createTestQueryClient();
    const user = createAuthUser();
    const jobPostingsKey = ["job-postings", "list"] as const;

    queryClient.setQueryData(authKeys.session(), user);
    queryClient.setQueryData(jobPostingsKey, ["cached job"]);

    resetSessionBoundState(queryClient);

    expect(queryClient.getQueryData(authKeys.session())).toEqual(user);
    expect(queryClient.getQueryData(jobPostingsKey)).toBeUndefined();
  });

  it("advances the generation before aborting all registered mutations", () => {
    const client = createTestQueryClient();
    const first = registerSessionBoundMutation(client);
    const second = registerSessionBoundMutation(client);
    const onAbort = vi.fn(() => expect(first.isCurrent()).toBe(false));
    first.signal.addEventListener("abort", onAbort);

    resetSessionBoundState(client);

    expect(onAbort).toHaveBeenCalledOnce();
    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(true);
    expect(second.isCurrent()).toBe(false);
    const next = registerSessionBoundMutation(client);
    expect(next.isCurrent()).toBe(true);
    expect(next.signal.aborted).toBe(false);
    next.release();
  });

  it("does not abort released mutations or mutations belonging to another client", () => {
    const client = createTestQueryClient();
    const released = registerSessionBoundMutation(client);
    const other = registerSessionBoundMutation(createTestQueryClient());
    released.release();

    resetSessionBoundState(client);

    expect(released.signal.aborted).toBe(false);
    expect(released.isCurrent()).toBe(false);
    expect(other.signal.aborted).toBe(false);
    expect(other.isCurrent()).toBe(true);
    other.release();
  });
});

describe("subscribeToAuthSession", () => {
  it.each([null, createAuthUser({ id: 2 })])(
    "resets application cache synchronously when the session changes to %j",
    (nextUser) => {
      const client = createTestQueryClient();
      client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
      const unsubscribe = subscribeToAuthSession(client);
      const mutation = registerSessionBoundMutation(client);
      client.setQueryData(["jobs"], ["user A data"]);

      client.setQueryData(authKeys.session(), nextUser);

      expect(mutation.isCurrent()).toBe(false);
      expect(mutation.signal.aborted).toBe(true);
      expect(client.getQueryData(["jobs"])).toBeUndefined();
      expect(client.getQueryData(authKeys.session())).toEqual(nextUser);
      unsubscribe();
    },
  );

  it("preserves mutations and cache when the same user is refreshed", () => {
    const client = createTestQueryClient();
    client.setQueryData(authKeys.session(), createAuthUser({ id: 1 }));
    const unsubscribe = subscribeToAuthSession(client);
    const mutation = registerSessionBoundMutation(client);
    client.setQueryData(["jobs"], ["user A data"]);

    client.setQueryData(
      authKeys.session(),
      createAuthUser({ id: 1, username: "updated" }),
    );

    expect(mutation.isCurrent()).toBe(true);
    expect(mutation.signal.aborted).toBe(false);
    expect(client.getQueryData(["jobs"])).toEqual(["user A data"]);
    mutation.release();
    unsubscribe();
  });

  it("keeps old mutations stale after logging back in as the same user", () => {
    const client = createTestQueryClient();
    const user = createAuthUser();
    client.setQueryData(authKeys.session(), user);
    const unsubscribe = subscribeToAuthSession(client);
    const mutation = registerSessionBoundMutation(client);

    client.setQueryData(authKeys.session(), null);
    client.setQueryData(authKeys.session(), user);

    expect(mutation.isCurrent()).toBe(false);
    expect(mutation.signal.aborted).toBe(true);
    unsubscribe();
  });
});
