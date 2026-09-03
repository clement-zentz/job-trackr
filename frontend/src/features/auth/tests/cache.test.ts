// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/tests/cache.test.ts

import { describe, expect, it } from "vitest";

import { createAuthUser } from "@/tests/factories/auth";
import { createTestQueryClient } from "@/tests/utils";

import { removeNonAuthQueries } from "../cache";
import { authKeys } from "../keys";

describe("removeNonAuthQueries", () => {
  it("removes non-auth queries while preserving auth queries", () => {
    const queryClient = createTestQueryClient();
    const user = createAuthUser();
    const jobPostingsKey = ["job-postings", "list"] as const;

    queryClient.setQueryData(authKeys.session(), user);
    queryClient.setQueryData(jobPostingsKey, ["cached job"]);

    removeNonAuthQueries(queryClient);

    expect(queryClient.getQueryData(authKeys.session())).toEqual(user);
    expect(queryClient.getQueryData(jobPostingsKey)).toBeUndefined();
  });
});
