// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/list/JobCandidacyCard.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJobCandidacyListItemRead } from "@/tests/factories/jobCandidacy";

import { JobCandidacyCard } from "../../list/JobCandidacyCard";
import { formatDateOnly } from "../../utils";

vi.mock("../../utils", () => ({
  formatDateOnly: vi.fn((value: string) => `Formatted ${value}`),
}));

const baseCandidacy = createJobCandidacyListItemRead({
  job_posting: {
    title: "Backend Engineer",
    company: "Acme",
    location: "Paris",
  },
  status_label: "Interview",
  applied_on: "2026-07-20",
  notes_preview: "Follow up with the recruiter next week.",
});

function renderJobCandidacyCard(overrides: Partial<typeof baseCandidacy> = {}) {
  return render(
    <JobCandidacyCard
      candidacy={{
        ...baseCandidacy,
        ...overrides,
      }}
    />,
  );
}

describe("JobCandidacyCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main candidacy information", () => {
    renderJobCandidacyCard();

    expect(
      screen.getByRole("heading", {
        name: "Backend Engineer",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Acme · Paris")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("renders the formatted application date", () => {
    renderJobCandidacyCard();

    expect(screen.getByText("Applied on")).toBeInTheDocument();
    expect(screen.getByText("Formatted 2026-07-20")).toBeInTheDocument();

    expect(formatDateOnly).toHaveBeenCalledTimes(1);
    expect(formatDateOnly).toHaveBeenCalledWith("2026-07-20");
  });

  it("trims and renders the notes preview", () => {
    renderJobCandidacyCard({
      notes_preview: "  Follow up with the recruiter next week.  ",
    });

    expect(screen.getByText("Notes")).toBeInTheDocument();

    expect(
      screen.getByText("Follow up with the recruiter next week."),
    ).toBeInTheDocument();
  });

  it.each(["", "   "])(
    "does not render notes when the preview is %j",
    (notesPreview) => {
      renderJobCandidacyCard({
        notes_preview: notesPreview,
      });

      expect(screen.queryByText("Notes")).not.toBeInTheDocument();
    },
  );
});
