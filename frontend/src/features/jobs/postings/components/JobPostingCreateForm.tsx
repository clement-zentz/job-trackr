// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCreateForm.tsx

import { type SubmitEventHandler, useState } from "react";
import type { JobPostingCreatePayload } from "../types";
import type { EmploymentType, Platform, WorkMode } from "../choices";

const formClassName = `
  space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
`.trim();

const errorClassName = `
  rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
`.trim();

const fieldClassName = `
  w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm
  placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500/20
  disabled:cursor-not-allowed disabled:bg-slate-100
`.trim();

const textareaClassName = `${fieldClassName} min-h-32 resize-y`;

const labelClassName = `
  block text-sm font-medium text-slate-700
`.trim();

const fieldWrapperClassName = `
  space-y-1.5
`.trim();

const checkboxLabelClassName = `
  flex items-center gap-2 text-sm font-medium text-slate-700
`.trim();

const checkboxClassName = `
  h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed
`.trim();

const submitButtonClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300
`.trim();

interface JobPostingCreateFormProps {
  onSubmit: (payload: JobPostingCreatePayload) => void;
  isSubmitting?: boolean;
  error?: string;
}

export function JobPostingCreateForm({
  onSubmit,
  isSubmitting = false,
  error,
}: JobPostingCreateFormProps) {
  const [form, setForm] = useState<JobPostingCreatePayload>({
    title: "",
    company: "",
    location: "",

    url: "",
    salary: "",
    description: "",

    easy_apply: false,
    active_hiring: false,

    platform: undefined,
    employment_type: undefined,
    work_mode: undefined,

    posted_at: null,
  });

  const updateField = <K extends keyof JobPostingCreatePayload>(
    field: K,
    value: JobPostingCreatePayload[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    onSubmit({
      ...form,
      url: form.url || undefined,
      salary: form.salary || undefined,
      description: form.description || undefined,
      platform: form.platform || undefined,
      employment_type: form.employment_type || undefined,
      work_mode: form.work_mode || undefined,
      posted_at: form.posted_at || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {error && <p className={errorClassName}>{error}</p>}

      <div className={fieldWrapperClassName}>
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <input
          id="title"
          className={fieldClassName}
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="company" className={labelClassName}>
          Company
        </label>
        <input
          id="company"
          className={fieldClassName}
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="location" className={labelClassName}>
          Location
        </label>
        <input
          id="location"
          className={fieldClassName}
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="url" className={labelClassName}>
          URL
        </label>
        <input
          id="url"
          className={fieldClassName}
          type="url"
          value={form.url ?? ""}
          onChange={(event) => updateField("url", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="salary" className={labelClassName}>
          Salary
        </label>
        <input
          id="salary"
          className={fieldClassName}
          value={form.salary ?? ""}
          onChange={(event) => updateField("salary", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Description
        </label>
        <textarea
          id="description"
          className={textareaClassName}
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <label className={checkboxLabelClassName}>
        <input
          type="checkbox"
          className={checkboxClassName}
          checked={form.easy_apply ?? false}
          onChange={(event) => updateField("easy_apply", event.target.checked)}
          disabled={isSubmitting}
        />
        Easy Apply
      </label>

      <label className={checkboxLabelClassName}>
        <input
          type="checkbox"
          className={checkboxClassName}
          checked={form.active_hiring ?? false}
          onChange={(event) =>
            updateField("active_hiring", event.target.checked)
          }
          disabled={isSubmitting}
        />
        Active Hiring
      </label>

      <div>
        <label htmlFor="platform" className={labelClassName}>
          Platform
        </label>
        <select
          id="platform"
          className={fieldClassName}
          value={form.platform ?? ""}
          onChange={(event) =>
            updateField(
              "platform",
              event.target.value ? (event.target.value as Platform) : undefined,
            )
          }
          disabled={isSubmitting}
        >
          <option value={""}>Select a platform</option>
          <option value={"linkedin"}>LinkedIn</option>
          <option value={"indeed"}>Indeed</option>
          <option value={"wttj"}>Welcome To The Jungle</option>
          <option value={"career_page"}>Career Page</option>
          <option value={"unknown"}>Unknown</option>
        </select>
      </div>

      <div>
        <label htmlFor="employment_type" className={labelClassName}>
          Employment Type
        </label>
        <select
          id="employment_type"
          className={fieldClassName}
          value={form.employment_type ?? ""}
          onChange={(event) =>
            updateField(
              "employment_type",
              event.target.value
                ? (event.target.value as EmploymentType)
                : undefined,
            )
          }
          disabled={isSubmitting}
        >
          <option value={""}>Select an employment type</option>
          <option value={"full_time"}>Full Time</option>
          <option value={"part_time"}>Part Time</option>
          <option value={"internship"}>Internship</option>
          <option value={"apprenticeship"}>Apprenticeship</option>
          <option value={"fixed_term"}>Fixed Term</option>
          <option value={"freelance"}>Freelance</option>
          <option value={"unknown"}>Unknown</option>
        </select>
      </div>

      <div>
        <label htmlFor="work_mode" className={labelClassName}>
          Work Mode
        </label>
        <select
          id="work_mode"
          className={fieldClassName}
          value={form.work_mode ?? ""}
          onChange={(event) =>
            updateField(
              "work_mode",
              event.target.value ? (event.target.value as WorkMode) : undefined,
            )
          }
          disabled={isSubmitting}
        >
          <option value={""}>Select a work mode</option>
          <option value={"on_site"}>On-site</option>
          <option value={"hybrid"}>Hybrid</option>
          <option value={"remote"}>Remote</option>
          <option value={"unknown"}>Unknown</option>
        </select>
      </div>

      <button
        type="submit"
        className={submitButtonClassName}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create job posting"}
      </button>
    </form>
  );
}
