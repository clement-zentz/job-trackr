// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/session/GuestOnlyRoute.tsx

import { type Location, Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../../hooks/useSession";

type LocationState = {
  from?: Location;
};

export function GuestOnlyRoute() {
  const { data: user } = useSession();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;

  return user ? <Navigate to={from ?? "/"} replace /> : <Outlet />;
}
