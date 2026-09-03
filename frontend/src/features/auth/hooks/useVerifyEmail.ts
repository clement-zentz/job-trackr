// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useVerifyEmail.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verifyEmail } from "../api/authApi";
import { authKeys } from "../keys";

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => verifyEmail(key),

    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: authKeys.session() });

      const user = response.meta.is_authenticated
        ? (response.data.user ?? null)
        : null;

      queryClient.setQueryData(authKeys.session(), user);
    },
  });
};
