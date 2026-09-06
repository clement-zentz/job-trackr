// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useLogout.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../api/authApi";
import { resetSessionBoundState } from "../cache";
import { authKeys } from "../keys";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),

    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.session() });

      queryClient.setQueryData(authKeys.session(), null);

      resetSessionBoundState(queryClient);
    },
  });
};
