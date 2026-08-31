// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/ResetPasswordForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

import type { ResetPasswordPayload } from "../../types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

interface ResetPasswordFormProps {
  resetKey: string;
  onSubmit: (payload: ResetPasswordPayload) => void;
  isPending?: boolean;
  errorMessage?: string;
  statusMessage?: string;
}

export function ResetPasswordForm({
  resetKey,
  onSubmit,
  isPending = false,
  errorMessage,
  statusMessage,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError(undefined);

    onSubmit({
      key: resetKey,
      password,
    });
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
      aria-busy={isPending}
    >
      <InputField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
        value={password}
        onChange={setPassword}
      />

      <InputField
        id="password-confirmation"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
      />

      {statusMessage && (
        <FormMessage variant="status">{statusMessage}</FormMessage>
      )}

      {validationError && (
        <FormMessage variant="error">{validationError}</FormMessage>
      )}

      {!validationError && errorMessage && (
        <FormMessage variant="error">{errorMessage}</FormMessage>
      )}

      <SubmitButton isPending={isPending} pendingLabel="Resetting password...">
        Reset password
      </SubmitButton>
    </form>
  );
}
