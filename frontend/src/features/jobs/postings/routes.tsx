// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/routes.tsx

import type { RouteObject } from "react-router-dom";
import { JobPostingsPage } from "./pages/JobPostingsPage";
import { CreateJobPostingPage } from "./pages/CreateJobPostingPage";
import { JobPostingDetailPage } from "./pages/JobPostingDetailPage";

export const jobPostingsRoutes: RouteObject[] = [
  {
    path: "postings",
    children: [
      {
        index: true,
        element: <JobPostingsPage />,
      },
      {
        path: "new",
        element: <CreateJobPostingPage />,
      },
      {
        path: ":id",
        element: <JobPostingDetailPage />,
      },
    ],
  },
];
