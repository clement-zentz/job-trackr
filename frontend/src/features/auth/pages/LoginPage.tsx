// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/pages/LoginPage.tsx

import { Link, Navigate } from "react-router-dom";

import { AuthPageHeader } from "../components/AuthPageHeader";
import { LoginForm } from "../components/form/LoginForm";
import { useLogin } from "../hooks/useLogin";
import type { LoginPayload } from "../types";

export function LoginPage() {
  const loginMutation = useLogin();

  const handleSubmit = (payload: LoginPayload) => {
    loginMutation.mutate(payload);
  };

  if (loginMutation.isSuccess && loginMutation.data.meta.is_authenticated) {
    return <Navigate to="/" replace />;
  }

  const requiresAdditionalAuthentication =
    loginMutation.isSuccess && !loginMutation.data.meta.is_authenticated;

  return (
    <>
      <AuthPageHeader
        title="Sign in"
        description="Enter your credentials to access your account."
      />

      <LoginForm
        onSubmit={handleSubmit}
        isPending={loginMutation.isPending}
        statusMessage={
          requiresAdditionalAuthentication
            ? "Additional verification is required before you can sign in. Please check your email."
            : undefined
        }
        errorMessage={
          loginMutation.isError
            ? "We could not sign you in. Please check your credentials and try again."
            : undefined
        }
      />

      <div className="mt-6 space-y-3 text-center">
        <div>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div>
          <span className="text-sm text-slate-500">
            Don't have an account?{" "}
          </span>

          <Link
            to="/register"
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </>
  );
}
