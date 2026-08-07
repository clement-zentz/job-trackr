// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/actions/BackToCandidacyLink.test.tsx

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { BackToCandidacyLink } from "../../actions";

describe("BackToCandidacyLink", () => {
  it("links to the job candidacy detail page", () => {
    render(
      <MemoryRouter>
        <BackToCandidacyLink candidacyId="candidacy-1" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Back to job candidacy" }),
    ).toHaveAttribute("href", "/jobs/candidacies/candidacy-1");
  });
});
