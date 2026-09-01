// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/ResetPasswordPage.tsx

import { Link, useParams } from "react-router-dom";

import { AuthPageHeader } from "../components/AuthPageHeader";
import { ResetPasswordForm } from "../components/form/ResetPasswordForm";
import { useResetPassword } from "../hooks/useResetPassword";
import type { ResetPasswordPayload } from "../types";

export function ResetPasswordPage() {
  const { key } = useParams<{ key: string }>();
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = (payload: ResetPasswordPayload) => {
    resetPasswordMutation.mutate(payload);
  };

  if (!key) {
    return (
      <>
        <AuthPageHeader
          title="Invalid password reset link"
          description="The password reset link is missing its reset key."
        />

        <p className="text-center text-sm text-slate-500">
          Please request a new password reset link.
        </p>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    const isAuthenticated = resetPasswordMutation.data.meta.is_authenticated;

    return (
      <>
        <AuthPageHeader
          title="Password reset"
          description="Your password has been successfully reset."
        />

        <div className="text-center">
          <Link
            to={isAuthenticated ? "/" : "/login"}
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            {isAuthenticated ? "Continue to dashboard" : "Continue to login"}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthPageHeader
        title="Reset your password"
        description="Enter a new password for your account."
      />

      <ResetPasswordForm
        resetKey={key}
        onSubmit={handleSubmit}
        isPending={resetPasswordMutation.isPending}
        errorMessage={
          resetPasswordMutation.isError
            ? "We could not reset your password. The reset link may be invalid or expired."
            : undefined
        }
      />
    </>
  );
}
