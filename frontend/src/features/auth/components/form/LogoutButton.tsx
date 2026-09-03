// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/LogoutButton.tsx

import { useLogout } from "../../hooks/useLogout";
import { FormMessage } from "./FormMessage";

export function LogoutButton() {
  const logoutMutation = useLogout();

  const handleClick = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={logoutMutation.isPending}
        aria-busy={logoutMutation.isPending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign out"}
      </button>

      {logoutMutation.isError && (
        <FormMessage variant="error">
          Sign out failed. Please try again.
        </FormMessage>
      )}
    </>
  );
}
