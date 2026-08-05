// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/actions/CreateJobCandidacyLink.test.tsx

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { CreateJobCandidacyLink } from "../../actions/CreateJobCandidacyLink";

describe("CreateJobCandidacyLink", () => {
  it("links to the candidacy creation page for the job posting", () => {
    render(
      <MemoryRouter>
        <CreateJobCandidacyLink jobPostingId="job-posting-1" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", {
        name: "Create job candidacy",
      }),
    ).toHaveAttribute(
      "href",
      "/jobs/candidacies/new?jobPostingId=job-posting-1",
    );
  });
});
