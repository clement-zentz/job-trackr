// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/TextareaField.tsx

import {
  labelClassName,
  fieldWrapperClassName,
  fieldClassName,
} from "./formStyles";

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function TextareaField({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  onChange,
}: TextareaFieldProps) {
  return (
    <div className={fieldWrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${fieldClassName} min-h-32 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
