// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app";
import { jobOfferRoutes } from "@/features/job_offers/routes";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [...jobOfferRoutes],
  },
]);
