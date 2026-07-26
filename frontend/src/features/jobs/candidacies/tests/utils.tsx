// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/utils.tsx

import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { renderWithQueryClient } from "@/tests/utils";

import { jobCandidaciesRoutes } from "../routes";

export function renderJobCandidaciesRoute(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/jobs",
        children: jobCandidaciesRoutes,
      },
    ],
    {
      initialEntries: [initialEntry],
    },
  );

  return renderWithQueryClient(<RouterProvider router={router} />);
}
