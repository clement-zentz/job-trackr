// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/tests/routes.test.tsx

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderJobCandidaciesRoute } from "./utils";

describe("jobCandidaciesRoutes", () => {
  it("renders the job candidacies page at /jobs/candidacies", async () => {
    renderJobCandidaciesRoute("/jobs/candidacies");

    expect(
      await screen.findByRole("heading", { name: "Job Candidacies" }),
    ).toBeInTheDocument();
  });
});
