// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/hooks/useRequestPasswordReset.ts

import { useMutation } from "@tanstack/react-query";

import { requestPasswordReset } from "../api/authApi";

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
