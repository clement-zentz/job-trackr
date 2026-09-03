// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/session/AuthBootstrap.tsx

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { removeNonAuthQueries } from "../../cache";
import { useSession } from "../../hooks/useSession";
import type { AuthUser } from "../../types";

export function AuthBootstrap() {
  const queryClient = useQueryClient();
  const session = useSession();
  const previousUserRef = useRef<AuthUser | null | undefined>(session.data);

  useEffect(() => {
    if (session.isSuccess && previousUserRef.current && session.data === null) {
      removeNonAuthQueries(queryClient);
    }

    if (session.isSuccess) {
      previousUserRef.current = session.data;
    }
  }, [queryClient, session.data, session.isSuccess]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (session.isLoadingError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Unable to determine your authentication status.</p>

        <button type="button" onClick={() => void session.refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return <Outlet />;
}
