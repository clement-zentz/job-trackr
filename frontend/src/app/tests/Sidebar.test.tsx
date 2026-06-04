// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/tests/Sidebar.test.tsx

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { Sidebar } from "../Sidebar";

describe("Sidebar", () => {
  it("links to the job postings page", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Job Postings" })).toHaveAttribute(
      "href",
      "/jobs/postings",
    );
  });
});
