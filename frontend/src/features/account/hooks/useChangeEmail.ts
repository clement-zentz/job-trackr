// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/useChangeEmail.ts

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";

import { requestEmailChange, resendEmailVerification } from "../api/accountApi";

type EmailChangeRequest = {
  email: string;
  action: "change" | "resend";
};

export function useChangeEmail() {
  return useSessionBoundMutation({
    mutationFn: ({ email, action }: EmailChangeRequest, signal) =>
      action === "resend"
        ? resendEmailVerification(email, signal)
        : requestEmailChange(email, signal),
  });
}
