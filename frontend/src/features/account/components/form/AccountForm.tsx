// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/AccountForm.tsx

import { type SubmitEventHandler, useLayoutEffect, useReducer } from "react";

import { InputField } from "@/components/form";

import type { UserAccountFormValues } from "../../types";

const formClassName = `
  space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm
`.trim();

const errorClassName = `
  rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
`.trim();

const statusClassName = `
  rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700
`.trim();

const submitButtonClassName = `
  inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold
  text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2
  focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300
`.trim();

interface AccountFormProps {
  initialValues: UserAccountFormValues;
  savedValues?: UserAccountFormValues;
  onSubmit: (values: UserAccountFormValues) => void;
  isSubmitting?: boolean;
  error?: string;
  status?: string;
}

interface FormState {
  values: UserAccountFormValues;
  baseline: UserAccountFormValues;
}

type FormAction =
  | {
      type: "edit";
      field: keyof UserAccountFormValues;
      value: string;
    }
  | {
      type: "server-refresh";
      values: UserAccountFormValues;
    }
  | {
      type: "save-success";
      values: UserAccountFormValues;
    };

function mergeServerValues(
  state: FormState,
  serverValues: UserAccountFormValues,
): FormState {
  return {
    values: {
      username:
        state.values.username === state.baseline.username
          ? serverValues.username
          : state.values.username,

      first_name:
        state.values.first_name === state.baseline.first_name
          ? serverValues.first_name
          : state.values.first_name,

      last_name:
        state.values.last_name === state.baseline.last_name
          ? serverValues.last_name
          : state.values.last_name,
    },

    baseline: serverValues,
  };
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "edit":
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value,
        },
      };

    case "server-refresh":
      return mergeServerValues(state, action.values);

    case "save-success":
      return {
        values: action.values,
        baseline: action.values,
      };
  }
}

function areValuesEqual(
  left: UserAccountFormValues,
  right: UserAccountFormValues,
) {
  return (
    left.username === right.username &&
    left.first_name === right.first_name &&
    left.last_name === right.last_name
  );
}

export function AccountForm({
  initialValues,
  savedValues,
  onSubmit,
  isSubmitting = false,
  error,
  status,
}: AccountFormProps) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    baseline: initialValues,
  });

  const {
    username: initialUsername,
    first_name: initialFirstName,
    last_name: initialLastName,
  } = initialValues;

  useLayoutEffect(() => {
    dispatch({
      type: "server-refresh",
      values: {
        username: initialUsername,
        first_name: initialFirstName,
        last_name: initialLastName,
      },
    });
  }, [initialUsername, initialFirstName, initialLastName]);

  useLayoutEffect(() => {
    if (!savedValues) {
      return;
    }

    dispatch({
      type: "save-success",
      values: savedValues,
    });
  }, [savedValues]);

  const form = state.values;
  const isDirty = !areValuesEqual(form, state.baseline);

  const updateField = (field: keyof UserAccountFormValues, value: string) => {
    dispatch({
      type: "edit",
      field,
      value,
    });
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (isSubmitting || !isDirty || !form.username) {
      return;
    }

    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={formClassName}
      aria-busy={isSubmitting}
    >
      {error && (
        <p role="alert" className={errorClassName}>
          {error}
        </p>
      )}

      {status && (
        <p role="status" className={statusClassName}>
          {status}
        </p>
      )}

      <InputField
        id="username"
        label="Username"
        value={form.username}
        onChange={(value) => updateField("username", value)}
        autoComplete="username"
        required
        disabled={isSubmitting}
      />

      <InputField
        id="first_name"
        label="First name"
        value={form.first_name}
        onChange={(value) => updateField("first_name", value)}
        autoComplete="given-name"
        disabled={isSubmitting}
      />

      <InputField
        id="last_name"
        label="Last name"
        value={form.last_name}
        onChange={(value) => updateField("last_name", value)}
        autoComplete="family-name"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        className={submitButtonClassName}
        disabled={isSubmitting || !isDirty}
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
