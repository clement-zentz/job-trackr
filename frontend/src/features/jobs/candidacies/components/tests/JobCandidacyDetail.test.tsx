// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/JobCandidacyDetail.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobCandidacyDetailRead } from "@/tests/factories/jobCandidacy";

import { JobCandidacyDetail } from "../JobCandidacyDetail";
import { formatDateOnly } from "../utils";

vi.mock("../utils", () => ({
  formatDateOnly: vi.fn((value: string) => `Formatted ${value}`),
}));

const baseCandidacy = createJobCandidacyDetailRead({
  job_posting: {
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
  },
  status_label: "Interview",
  applied_on: "2026-07-20",
  notes: "Follow up with the recruiter next week.",
});

function renderJobCandidacyDetail(
  overrides: Partial<typeof baseCandidacy> = {},
) {
  return render(
    <JobCandidacyDetail
      candidacy={{
        ...baseCandidacy,
        ...overrides,
      }}
    />,
  );
}

describe("JobCandidacyDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main candidacy information", () => {
    renderJobCandidacyDetail();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Backend Engineer",
      }),
    ).toBeInTheDocument();

    const company = screen.getByText("Acme");
    const companyAndLocation = company.closest("p");
    expect(companyAndLocation).not.toBeNull();
    expect(companyAndLocation).toHaveTextContent("Acme · Paris");

    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("renders the formatted application date", () => {
    renderJobCandidacyDetail();

    expect(screen.getByText("Applied on")).toBeInTheDocument();
    expect(screen.getByText("Formatted 2026-07-20")).toBeInTheDocument();

    expect(formatDateOnly).toHaveBeenCalledTimes(1);
    expect(formatDateOnly).toHaveBeenCalledWith("2026-07-20");
  });

  it("trims and renders the candidacy notes", () => {
    renderJobCandidacyDetail({
      notes: " Follow up with the recruiter next week. ",
    });

    expect(screen.getByText("Notes")).toBeInTheDocument();

    const notes = screen.getByText("Follow up with the recruiter next week.");

    expect(notes.textContent).toBe("Follow up with the recruiter next week.");
  });

  it.each(["", " ", "\n\t"])(
    "renders the fallback when notes are %j",
    (notes) => {
      renderJobCandidacyDetail({ notes });

      expect(screen.getByText("Notes")).toBeInTheDocument();
      expect(screen.getByText("No notes have been added.")).toBeInTheDocument();
    },
  );
});
