// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/SelectField.tsx

import {
  labelClassName,
  fieldClassName,
  fieldWrapperClassName,
} from "./formStyles";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export type SelectFieldProps<T extends string> = {
  id: string;
  label: string;
  value: "" | T;
  placeholder: string;
  options: readonly SelectOption<T>[];
  disabled?: boolean;
  onChange: (value: "" | T) => void;
};

export function SelectField<T extends string>({
  id,
  label,
  value,
  placeholder,
  options,
  disabled = false,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <div className={fieldWrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <select
        id={id}
        className={fieldClassName}
        value={value}
        onChange={(event) => onChange(event.target.value as "" | T)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
