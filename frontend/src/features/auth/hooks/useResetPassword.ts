// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useResetPassword.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resetPassword } from "../api/authApi";
import { authKeys } from "../keys";
import type { ResetPasswordPayload } from "../types";

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),

    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: authKeys.session() });

      const user = response.meta.is_authenticated
        ? (response.data.user ?? null)
        : null;

      queryClient.setQueryData(authKeys.session(), user);
    },
  });
};
