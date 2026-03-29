// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app";
import { jobPostingsRoutes } from "@/features/jobs/postings";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <div className="p-6">Dashboard</div>,
      },
      {
        path: "settings",
        element: <div className="p-6">Settings</div>,
      },
      ...jobPostingsRoutes,
    ],
  },
]);
