// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/session/RequireAuth.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../../hooks/useSession";

export function RequireAuth() {
  const { data: user } = useSession();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
