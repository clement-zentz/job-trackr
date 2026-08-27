// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/types.ts

export interface AuthUser {
  id: number;
  display: string;
  username: string;
  email: string;
  has_usable_password: boolean;
}

export interface AuthFlow {
  id: string;
  is_pending?: boolean;
}

export interface AuthMeta {
  is_authenticated: boolean;
}

export interface AuthResponse {
  status: number;
  data: {
    user?: AuthUser;
    flows?: AuthFlow[];
  };
  meta: AuthMeta;
}

export interface AuthError {
  code: string;
  message: string;
  param?: string;
}

export interface AuthErrorResponse {
  status: number;
  errors: AuthError[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  key: string;
  password: string;
}
