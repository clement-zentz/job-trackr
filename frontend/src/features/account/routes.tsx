// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/routes.tsx

import type { RouteObject } from "react-router-dom";

import { AccountPage } from "./pages/AccountPage";

export const accountRoutes: RouteObject[] = [
  {
    path: "account",
    element: <AccountPage />,
  },
];
