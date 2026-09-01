// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/ForgotPasswordPage.tsx

import { Link } from "react-router-dom";

import { AuthPageHeader } from "../components/AuthPageHeader";
import { ForgotPasswordForm } from "../components/form/ForgotPasswordForm";
import { useRequestPasswordReset } from "../hooks/useRequestPasswordReset";

export function ForgotPasswordPage() {
  const requestPasswordResetMutation = useRequestPasswordReset();

  const handleSubmit = (email: string) => {
    requestPasswordResetMutation.mutate(email);
  };

  return (
    <>
      <AuthPageHeader
        title="Forgot your password?"
        description="Enter your email address and we'll send you a password reset link."
      />

      <ForgotPasswordForm
        onSubmit={handleSubmit}
        isPending={requestPasswordResetMutation.isPending}
        statusMessage={
          requestPasswordResetMutation.isSuccess
            ? "If an account exists for that email address, a password reset link has been sent."
            : undefined
        }
        errorMessage={
          requestPasswordResetMutation.isError
            ? "We could not send the password reset link. Please try again."
            : undefined
        }
      />

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-slate-900 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </>
  );
}
