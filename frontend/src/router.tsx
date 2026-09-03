// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app";
import { AuthBootstrap } from "@/features/auth/components/session/AuthBootstrap";
import { GuestOnlyRoute } from "@/features/auth/components/session/GuestOnlyRoute";
import { RequireAuth } from "@/features/auth/components/session/RequireAuth";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { jobCandidaciesRoutes } from "@/features/jobs/candidacies";
import { jobPostingsRoutes } from "@/features/jobs/postings";

export const router = createBrowserRouter([
  {
    element: <AuthBootstrap />,
    children: [
      {
        element: <GuestOnlyRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      {
        path: "verify-email/:key?",
        element: <VerifyEmailPage />,
      },
      {
        path: "reset-password/:key?",
        element: <ResetPasswordPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <div className="p-6">Dashboard</div>,
              },
              {
                path: "settings",
                element: <div className="p-6">Settings</div>,
              },
              {
                path: "jobs",
                children: [...jobPostingsRoutes, ...jobCandidaciesRoutes],
              },
            ],
          },
        ],
      },
    ],
  },
]);
