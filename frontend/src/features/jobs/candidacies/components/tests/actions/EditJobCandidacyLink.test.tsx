// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/actions/EditJobCandidacyLink.test.tsx

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { getJobCandidacyEditPath } from "../../../constants";
import { EditJobCandidacyLink } from "../../actions";

describe("EditJobCandidacyLink", () => {
  it("links to the job candidacy edit page", () => {
    render(
      <MemoryRouter>
        <EditJobCandidacyLink candidacyId="candidacy-1" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Edit job candidacy" }),
    ).toHaveAttribute("href", getJobCandidacyEditPath("candidacy-1"));
  });

  it("applies a custom class name", () => {
    render(
      <MemoryRouter>
        <EditJobCandidacyLink
          candidacyId="candidacy-1"
          className="custom-class"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Edit job candidacy" }),
    ).toHaveClass("custom-class");
  });
});
