// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/AppProviders.tsx

import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {/* Later: QueryClientProvider, ThemeProvider, etc. */}
      {children}
    </>
  );
}
