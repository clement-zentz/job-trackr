// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/SignupForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

import type { SignupPayload } from "../../types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

interface SignupFormProps {
  onSubmit: (payload: SignupPayload) => void;
  isPending?: boolean;
  errorMessage?: string;
  statusMessage?: string;
}

export function SignupForm({
  onSubmit,
  isPending = false,
  errorMessage,
  statusMessage,
}: SignupFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      username,
      email,
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
        id="username"
        label="Username"
        type="text"
        autoComplete="username"
        required
        disabled={isPending}
        value={username}
        onChange={setUsername}
      />

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

      <InputField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
        value={password}
        onChange={setPassword}
      />

      <InputField
        id="password-confirmation"
        label="Confirm password"
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

      <SubmitButton isPending={isPending} pendingLabel="Creating account...">
        Create account
      </SubmitButton>
    </form>
  );
}
