// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/choices.ts

export const platformOptions = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "Welcome to the jungle" },
  { value: "career_page", label: "Career page" },
] as const;

export type Platform = "" | (typeof platformOptions)[number]["value"];

export const employmentTypeOptions = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "fixed_term", label: "Fixed-term" },
  { value: "freelance", label: "Freelance" },
] as const;

export type EmploymentType =
  | ""
  | (typeof employmentTypeOptions)[number]["value"];

export const workModeOptions = [
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export type WorkMode = "" | (typeof workModeOptions)[number]["value"];
