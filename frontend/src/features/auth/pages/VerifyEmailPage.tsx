// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/VerifyEmailPage.tsx

import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthPageHeader } from "../components/AuthPageHeader";
import { useVerifyEmail } from "../hooks/useVerifyEmail";

export function VerifyEmailPage() {
  const { key } = useParams<{ key: string }>();
  const { mutate, data, isSuccess, isError } = useVerifyEmail();

  useEffect(() => {
    if (!key) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      mutate(key);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [key, mutate]);

  if (!key) {
    return (
      <AuthLayout>
        <AuthPageHeader
          title="Invalid verification link"
          description="The email verification link is missing its verification key."
        />

        <p className="text-center text-sm text-slate-500">
          Please use the verification link from your email.
        </p>
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout>
        <AuthPageHeader
          title="Email verification failed"
          description="We could not verify your email address."
        />

        <p className="text-center text-sm text-slate-500">
          The verification link may be invalid or expired.
        </p>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    const isAuthenticated = data.meta.is_authenticated;

    return (
      <AuthLayout>
        <AuthPageHeader
          title="Email verified"
          description="Your email address has been successfully verified."
        />

        <div className="text-center">
          <Link
            to={isAuthenticated ? "/" : "/login"}
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            {isAuthenticated ? "Continue to dashboard" : "Continue to login"}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthPageHeader
        title="Verifying your email"
        description="Please wait while we verify your email address."
      />

      <p className="text-center text-sm text-slate-500">Verifying email...</p>
    </AuthLayout>
  );
}
