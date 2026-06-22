// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/form/InputField.tsx

import {
  labelClassName,
  fieldClassName,
  fieldWrapperClassName,
} from "./formStyles";

export type InputFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: "text" | "url" | "number" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
};

export function InputField({
  id,
  label,
  value,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  onChange,
}: InputFieldProps) {
  return (
    <div className={fieldWrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        className={fieldClassName}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
