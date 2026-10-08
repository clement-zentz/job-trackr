// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/useChangeEmail.ts

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";

import { requestEmailChange } from "../api/accountApi";

export function useChangeEmail() {
  return useSessionBoundMutation({
    mutationFn: (email: string, signal) => requestEmailChange(email, signal),
  });
}
