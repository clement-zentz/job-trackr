// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/choices.ts

export type Platform = "" | "linkedin" | "indeed" | "wttj" | "career_page";

export type EmploymentType =
  | ""
  | "full_time"
  | "part_time"
  | "internship"
  | "apprenticeship"
  | "fixed_term"
  | "freelance";

export type WorkMode = "" | "on_site" | "hybrid" | "remote";
