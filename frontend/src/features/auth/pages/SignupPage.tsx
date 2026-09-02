// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/SignupPage.tsx

import { Link } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthPageHeader } from "../components/AuthPageHeader";
import { SignupForm } from "../components/form/SignupForm";
import { useSignup } from "../hooks/useSignup";
import type { SignupPayload } from "../types";

export function SignupPage() {
  const signupMutation = useSignup();

  const handleSubmit = (payload: SignupPayload) => {
    signupMutation.mutate(payload);
  };

  if (signupMutation.isSuccess) {
    const isAuthenticated = signupMutation.data.meta.is_authenticated;

    return (
      <AuthLayout>
        <AuthPageHeader
          title="Account created"
          description={
            isAuthenticated
              ? "Your account has been successfully created."
              : "Your account has been created. Please check your email to verify your address."
          }
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
        title="Create your account"
        description="Enter your details to get started."
      />

      <SignupForm
        onSubmit={handleSubmit}
        isPending={signupMutation.isPending}
        errorMessage={
          signupMutation.isError
            ? "We could not create your account. Please check your details and try again."
            : undefined
        }
      />

      <div className="mt-6 text-center">
        <span className="text-sm text-slate-500">
          Already have an account?{" "}
        </span>

        <Link
          to="/login"
          className="text-sm font-medium text-slate-900 hover:underline"
        >
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
