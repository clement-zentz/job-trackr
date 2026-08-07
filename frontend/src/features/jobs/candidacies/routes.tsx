// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/routes.tsx

import type { RouteObject } from "react-router-dom";

import { JobCandidacyCreatePage } from "./pages/JobCandidacyCreatePage";
import { JobCandidacyDetailPage } from "./pages/JobCandidacyDetailPage";
import { JobCandidacyListPage } from "./pages/JobCandidacyListPage";
import { JobCandidacyUpdatePage } from "./pages/JobCandidacyUpdatePage";

export const jobCandidaciesRoutes: RouteObject[] = [
  {
    path: "candidacies",
    children: [
      {
        index: true,
        element: <JobCandidacyListPage />,
      },
      {
        path: "new",
        element: <JobCandidacyCreatePage />,
      },
      {
        path: ":candidacyId/edit",
        element: <JobCandidacyUpdatePage />,
      },
      {
        path: ":candidacyId",
        element: <JobCandidacyDetailPage />,
      },
    ],
  },
];
