// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useSignup.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signup } from "../api/authApi";
import { authKeys } from "../keys";
import type { SignupPayload } from "../types";

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),

    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: authKeys.session() });

      const user = response.meta.is_authenticated
        ? (response.data.user ?? null)
        : null;

      queryClient.setQueryData(authKeys.session(), user);
    },
  });
};
