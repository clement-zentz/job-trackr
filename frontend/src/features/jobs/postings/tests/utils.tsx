// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/tests/utils.tsx

import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { renderWithQueryClient } from "@/tests/utils";

import { jobPostingsRoutes } from "../routes";

export function renderJobPostingsRoute(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/jobs",
        children: jobPostingsRoutes,
      },
    ],
    {
      initialEntries: [initialEntry],
    },
  );

  return renderWithQueryClient(<RouterProvider router={router} />);
}
