// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/ForgotPasswordForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  isPending?: boolean;
  errorMessage?: string;
  statusMessage?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  isPending = false,
  errorMessage,
  statusMessage,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    onSubmit(email);
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
      aria-busy={isPending}
    >
      <InputField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        disabled={isPending}
        value={email}
        onChange={setEmail}
      />

      {statusMessage && (
        <FormMessage variant="status">{statusMessage}</FormMessage>
      )}

      {errorMessage && (
        <FormMessage variant="error">{errorMessage}</FormMessage>
      )}

      <SubmitButton isPending={isPending} pendingLabel="Sending reset link...">
        Send reset link
      </SubmitButton>
    </form>
  );
}
