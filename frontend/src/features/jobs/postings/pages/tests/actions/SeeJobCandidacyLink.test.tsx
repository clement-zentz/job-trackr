// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/pages/tests/actions/SeeJobCandidacyLink.test.tsx

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";

import { SeeJobCandidacyLink } from "../../actions/SeeJobCandidacyLink";

it("links to the job candidacy detail page", () => {
  render(
    <MemoryRouter>
      <SeeJobCandidacyLink candidacyId="candidacy-1" />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("link", { name: "See job candidacy" }),
  ).toHaveAttribute("href", "/jobs/candidacies/candidacy-1");
});
