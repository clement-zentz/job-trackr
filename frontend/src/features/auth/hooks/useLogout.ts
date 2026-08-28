// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useLogout.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../api/authApi";
import { authKeys } from "../keys";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),

    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);

      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== authKeys.all[0],
      });
    },
  });
};
