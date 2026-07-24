// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/choices.ts

export const statusChoices = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "technical_test", label: "Technical test" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

export type CandidacyStatus = (typeof statusChoices)[number]["value"];
