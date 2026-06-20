// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/JobPostingCreateForm.tsx

import { type SubmitEventHandler, useState } from "react";
import type { JobPostingCreatePayload } from "../types";
import { labelClassName, fieldClassName } from "./formStyles";
import { SelectField } from "./SelectField";
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

const textareaClassName = `${fieldClassName} min-h-32 resize-y`;

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
