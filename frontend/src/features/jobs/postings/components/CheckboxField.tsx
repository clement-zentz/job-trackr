// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/CheckboxField.tsx

const checkboxLabelClassName = `
  flex items-center gap-2 text-sm font-medium text-slate-700
`.trim();

const checkboxClassName = `
  h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed
`.trim();

type CheckboxFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function CheckboxField({
  id,
  label,
  checked,
  disabled = false,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className={checkboxLabelClassName}>
      <input
        id={id}
        type="checkbox"
        className={checkboxClassName}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  );
}
