// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useSession.ts

import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "../api/authApi";
import { authKeys } from "../keys";

export const useSession = () =>
  useQuery({
    queryKey: authKeys.session(),
    queryFn: async ({ signal }) => {
      const response = await getCurrentSession(signal);

      if (!response.meta.is_authenticated) {
        return null;
      }

      return response.data.user ?? null;
    },
    retry: false,
  });
