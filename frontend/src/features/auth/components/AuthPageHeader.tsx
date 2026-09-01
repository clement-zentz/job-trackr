// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/AuthPageHeader.tsx

interface AuthPageHeaderProps {
  title: string;
  description?: string;
}

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
