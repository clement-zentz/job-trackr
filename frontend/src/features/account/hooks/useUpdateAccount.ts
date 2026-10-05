// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/useUpdateAccount.ts

import { useQueryClient } from "@tanstack/react-query";

import { useSessionBoundMutation } from "@/features/auth/hooks/useSessionBoundMutation";
import { authKeys } from "@/features/auth/keys";

import { updateUserAccount } from "../api/accountApi";
import { accountKeys } from "../keys";
import type { UserAccountUpdatePayload } from "../types";

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useSessionBoundMutation({
    mutationFn: (payload: UserAccountUpdatePayload, signal) =>
      updateUserAccount(payload, signal),

    onSuccess: async (updatedAccount, _payload, session) => {
      await queryClient.cancelQueries({
        queryKey: accountKeys.detail(),
      });

      if (!session.isCurrent()) {
        return;
      }

      queryClient.setQueryData(accountKeys.detail(), updatedAccount);

      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}
