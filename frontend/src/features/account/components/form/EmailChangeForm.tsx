// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/EmailChangeForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

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

interface EmailChangeFormProps {
  currentEmail: string;
  onSubmit: (email: string) => void;
  isSubmitting?: boolean;
  error?: string;
  status?: string;
}

export function EmailChangeForm({
  currentEmail,
  onSubmit,
  isSubmitting = false,
  error,
  status,
}: EmailChangeFormProps) {
  const [email, setEmail] = useState("");

  const normalizedEmail = email.trim();

  const canSubmit =
    normalizedEmail.length > 0 && normalizedEmail !== currentEmail.trim();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isSubmitting || !canSubmit) {
      return;
    }

    onSubmit(normalizedEmail);
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

      <div>
        <p className="text-sm font-medium text-slate-700">Current email</p>
        <p className="mt-1 text-sm text-slate-900">
          {currentEmail || "Not provided"}
        </p>
      </div>

      <InputField
        id="new_email"
        label="New email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
        disabled={isSubmitting}
      />

      <p className="text-sm text-slate-500">
        We'll send a verification link to your new email address. Your current
        email will remain active until the new address is verified.
      </p>

      <button
        type="submit"
        className={submitButtonClassName}
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? "Sending verification..." : "Change email"}
      </button>
    </form>
  );
}
