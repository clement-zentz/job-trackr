// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/session/AuthBootstrap.tsx

import { Outlet } from "react-router-dom";

import { useSession } from "../../hooks/useSession";

export function AuthBootstrap() {
  const session = useSession();

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <Outlet />;
}
