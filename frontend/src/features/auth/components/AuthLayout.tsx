// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/AuthLayout.tsx

import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
