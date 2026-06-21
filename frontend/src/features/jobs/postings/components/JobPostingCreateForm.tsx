// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCreateForm.tsx

import { type SubmitEventHandler, useState } from "react";
import type { JobPostingCreatePayload } from "../types";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { TextareaField } from "./TextareaField";
import {
  platformOptions,
  employmentTypeOptions,
  workModeOptions,
  type EmploymentType,
  type Platform,
  type WorkMode,
} from "../choices";

const formClassName = `
  space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
`.trim();

const errorClassName = `
  rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
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

      <InputField
        id="title"
        label="Title"
        value={form.title}
        onChange={(value) => updateField("title", value)}
        placeholder="Job title"
        required
        disabled={isSubmitting}
      />

      <InputField
        id="company"
        label="Company"
        value={form.company}
        onChange={(value) => updateField("company", value)}
        placeholder="Company name"
        required
        disabled={isSubmitting}
      />

      <InputField
        id="location"
        label="Location"
        value={form.location}
        onChange={(value) => updateField("location", value)}
        placeholder="Job location"
        required
        disabled={isSubmitting}
      />

      <InputField
        id="url"
        label="URL"
        type="url"
        value={form.url ?? ""}
        onChange={(value) => updateField("url", value)}
        placeholder="Job posting URL"
        disabled={isSubmitting}
      />

      <InputField
        id="salary"
        label="Salary"
        value={form.salary ?? ""}
        onChange={(value) => updateField("salary", value)}
        placeholder="Salary range"
        disabled={isSubmitting}
      />

      <TextareaField
        id="description"
        label="Description"
        value={form.description ?? ""}
        onChange={(value) => updateField("description", value)}
        placeholder="Job description"
        disabled={isSubmitting}
      />

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

      <SelectField
        id="platform"
        label="Platform"
        value={form.platform ?? ""}
        placeholder="Select a platform"
        options={platformOptions}
        disabled={isSubmitting}
        onChange={(value: Platform) => updateField("platform", value)}
      />

      <SelectField
        id="employment_type"
        label="Employment Type"
        value={form.employment_type ?? ""}
        placeholder="Select an employment type"
        options={employmentTypeOptions}
        disabled={isSubmitting}
        onChange={(value: EmploymentType) =>
          updateField("employment_type", value)
        }
      />

      <SelectField
        id="work_mode"
        label="Work Mode"
        value={form.work_mode ?? ""}
        placeholder="Select a work mode"
        options={workModeOptions}
        disabled={isSubmitting}
        onChange={(value: WorkMode) => updateField("work_mode", value)}
      />

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
