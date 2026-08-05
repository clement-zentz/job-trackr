// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/form/JobCandidacyForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { statusChoices } from "@/features/jobs/candidacies/choices";
import type { JobCandidacyFormValues } from "@/features/jobs/candidacies/types";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/features/jobs/components/form";

const formClassName = `
  space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
`.trim();

const submitButtonClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300
`.trim();

export interface JobCandidacyFormProps {
  initialValues: JobCandidacyFormValues;
  onSubmit: (values: JobCandidacyFormValues) => void;
  isSubmitting?: boolean;
  error?: string;
  submitLabel: string;
  submittingLabel: string;
}

export function JobCandidacyForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  error,
  submitLabel,
  submittingLabel,
}: JobCandidacyFormProps) {
  const [form, setForm] = useState<JobCandidacyFormValues>(initialValues);

  const setFormField = <K extends keyof JobCandidacyFormValues>(
    field: K,
    value: JobCandidacyFormValues[K],
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

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <SelectField
        id="status"
        label="Status"
        value={form.status}
        placeholder="Select status"
        options={statusChoices}
        disabled={isSubmitting}
        onChange={(value) => {
          if (value === "") {
            return;
          }

          setFormField("status", value);
        }}
      />

      <InputField
        id="applied_on"
        label="Applied on"
        type="date"
        value={form.applied_on}
        onChange={(value) => setFormField("applied_on", value)}
        placeholder="Select a date"
        disabled={isSubmitting}
      />

      <TextareaField
        id="notes"
        label="Notes"
        value={form.notes}
        onChange={(value) => setFormField("notes", value)}
        placeholder="Enter notes"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonClassName}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
