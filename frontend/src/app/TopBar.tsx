// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/TopBar.tsx

import { LogoutButton } from "@/features/auth/components/form/LogoutButton";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-end border-b bg-white px-4">
      <LogoutButton />
    </header>
  );
}
