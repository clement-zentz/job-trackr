// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/routes.tsx

import type { RouteObject } from "react-router-dom";
import { JobPostingListPage } from "./pages/JobPostingListPage";
import { JobPostingCreatePage } from "./pages/JobPostingCreatePage";
import { JobPostingDetailPage } from "./pages/JobPostingDetailPage";

export const jobPostingsRoutes: RouteObject[] = [
  {
    path: "postings",
    children: [
      {
        index: true,
        element: <JobPostingListPage />,
      },
      {
        path: "new",
        element: <JobPostingCreatePage />,
      },
      {
        path: ":id",
        element: <JobPostingDetailPage />,
      },
    ],
  },
];
