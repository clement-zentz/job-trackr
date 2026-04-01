// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/routes.tsx

import type { RouteObject } from "react-router-dom";
import { JobPostingsPage } from "./pages/JobPostingsPage";

export const jobPostingsRoutes: RouteObject[] = [
  {
    path: "postings",
    element: <JobPostingsPage />,
  },
];
