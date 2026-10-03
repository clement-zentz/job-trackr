// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/hooks/useAccount.ts

import { useQuery } from "@tanstack/react-query";

import { getUserAccount } from "../api/accountApi";
import { accountKeys } from "../keys";

export function useAccount() {
  return useQuery({
    queryKey: accountKeys.detail(),
    queryFn: ({ signal }) => getUserAccount(signal),
  });
}
