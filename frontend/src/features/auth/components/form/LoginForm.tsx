// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/LoginForm.tsx

import { type SubmitEventHandler, useState } from "react";

import { InputField } from "@/components/form";

import type { LoginPayload } from "../../types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => void;
  isPending?: boolean;
  errorMessage?: string;
  statusMessage?: string;
}

export function LoginForm({
  onSubmit,
  isPending = false,
  errorMessage,
  statusMessage,
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    onSubmit({
      username,
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
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        disabled={isPending}
        value={password}
        onChange={setPassword}
      />

      {statusMessage && (
        <FormMessage variant="status">{statusMessage}</FormMessage>
      )}

      {errorMessage && (
        <FormMessage variant="error">{errorMessage}</FormMessage>
      )}

      <SubmitButton isPending={isPending} pendingLabel="Signing in...">
        Sign in
      </SubmitButton>
    </form>
  );
}
