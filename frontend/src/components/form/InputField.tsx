// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/components/form/InputField.tsx

import type { ComponentProps } from "react";

import {
  fieldClassName,
  fieldWrapperClassName,
  labelClassName,
} from "./formStyles";

export type InputFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: "text" | "url" | "number" | "email" | "password" | "date";
  placeholder?: string;
  autoComplete?: ComponentProps<"input">["autoComplete"];
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
  autoComplete,
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
        autoComplete={autoComplete}
        disabled={disabled}
      />
    </div>
  );
}
