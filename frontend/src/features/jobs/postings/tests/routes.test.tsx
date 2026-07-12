// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/tests/routes.test.tsx

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderJobPostingsRoute } from "./utils";

describe("jobPostingsRoutes", () => {
  it("renders the job postings page at /jobs/postings", async () => {
    renderJobPostingsRoute("/jobs/postings");

    expect(
      await screen.findByRole("heading", { name: "Job Postings" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Create job posting" }),
    ).toHaveAttribute("href", "/jobs/postings/new");
  });

  it("renders the create job posting page at /jobs/postings/new", async () => {
    renderJobPostingsRoute("/jobs/postings/new");

    expect(
      await screen.findByRole("heading", { name: "Create Job Posting" }),
    ).toBeInTheDocument();
  });

  it("renders the job posting detail page for a posting id", async () => {
    renderJobPostingsRoute("/jobs/postings/1");

    expect(
      await screen.findByRole("heading", { name: "Job Posting Detail" }),
    ).toBeInTheDocument();
  });

  it("renders the job posting update page for a posting id", async () => {
    renderJobPostingsRoute("/jobs/postings/1/edit");

    expect(
      await screen.findByRole("heading", { name: "Update Job Posting" }),
    ).toBeInTheDocument();
  });
});
