// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/SubmitButton.tsx

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  isPending?: boolean;
}

export function SubmitButton({
  children,
  pendingLabel = "Submitting...",
  isPending = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : children}
    </button>
  );
}
