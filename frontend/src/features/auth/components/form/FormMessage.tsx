// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/FormMessage.tsx

interface FormMessageProps {
  children: React.ReactNode;
  variant: "error" | "status";
}

export function FormMessage({ children, variant }: FormMessageProps) {
  const isError = variant === "error";

  return (
    <p
      role={isError ? "alert" : "status"}
      className={isError ? "text-sm text-red-600" : "text-sm text-amber-700"}
    >
      {children}
    </p>
  );
}
