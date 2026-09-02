// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/session/GuestOnlyRoute.tsx

import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "../../hooks/useSession";

export function GuestOnlyRoute() {
  const { data: user } = useSession();

  return user ? <Navigate to="/" replace /> : <Outlet />;
}
