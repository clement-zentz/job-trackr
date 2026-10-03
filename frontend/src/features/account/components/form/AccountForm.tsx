// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/AccountForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

import type { UserAccountFormValues } from "../../types";

const formClassName = `
  space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
`.trim();

const errorClassName = `
  rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
`.trim();

const statusClassName = `
  rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700
`.trim();

const submitButtonClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300
`.trim();

interface AccountFormProps {
  initialValues: UserAccountFormValues;
  onSubmit: (values: UserAccountFormValues) => void;
  isSubmitting?: boolean;
  error?: string;
  status?: string;
}

export function AccountForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  error,
  status,
}: AccountFormProps) {
  const [form, setForm] = useState<UserAccountFormValues>(initialValues);

  const updateField = <K extends keyof UserAccountFormValues>(
    field: K,
    value: UserAccountFormValues[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const isDirty =
    form.username !== initialValues.username ||
    form.first_name !== initialValues.first_name ||
    form.last_name !== initialValues.last_name;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isSubmitting || !isDirty || !form.username) {
      return;
    }

    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={formClassName}
      aria-busy={isSubmitting}
    >
      {error && (
        <p role="alert" className={errorClassName}>
          {error}
        </p>
      )}

      {status && (
        <p role="status" className={statusClassName}>
          {status}
        </p>
      )}

      <InputField
        id="username"
        label="Username"
        value={form.username}
        onChange={(value) => updateField("username", value)}
        autoComplete="username"
        required
        disabled={isSubmitting}
      />

      <InputField
        id="first_name"
        label="First name"
        value={form.first_name}
        onChange={(value) => updateField("first_name", value)}
        autoComplete="given-name"
        disabled={isSubmitting}
      />

      <InputField
        id="last_name"
        label="Last name"
        value={form.last_name}
        onChange={(value) => updateField("last_name", value)}
        autoComplete="family-name"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        className={submitButtonClassName}
        disabled={isSubmitting || !isDirty}
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
