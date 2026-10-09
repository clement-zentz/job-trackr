// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/pages/AccountPage.tsx

import { AccountForm } from "../components/form/AccountForm";
import {
  formValuesToUpdatePayload,
  userAccountToFormValues,
} from "../components/form/accountFormMappers";
import { EmailChangeForm } from "../components/form/EmailChangeForm";
import {
  getAccountUpdateErrorMessage,
  getEmailChangeErrorMessage,
} from "../errors";
import { useAccount } from "../hooks/useAccount";
import { useChangeEmail } from "../hooks/useChangeEmail";
import { useUpdateAccount } from "../hooks/useUpdateAccount";

const mainClassName = "mx-auto max-w-3xl px-4 py-8";
const h1ClassName = "text-2xl font-bold text-slate-900";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

export function AccountPage() {
  const accountQuery = useAccount();
  const updateAccount = useUpdateAccount();
  const changeEmail = useChangeEmail();

  if (!accountQuery.data) {
    if (accountQuery.isLoading) {
      return (
        <div className={mainClassName}>
          <h1 className={h1ClassName}>Account</h1>
          <p className="mt-4">Loading account...</p>
        </div>
      );
    }

    return (
      <div className={mainClassName}>
        <h1 className={h1ClassName}>Account</h1>
        <p className="mt-4 text-red-500">Could not load account.</p>
      </div>
    );
  }

  const account = accountQuery.data;
  const initialValues = userAccountToFormValues(account);

  return (
    <div className={mainClassName}>
      <div className="mb-6">
        <h1 className={h1ClassName}>Account</h1>

        <p className="mt-1 text-sm text-slate-500">
          View and update your personal information.
        </p>
      </div>

      {accountQuery.isError && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not refresh account information. Showing previously loaded data.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Profile</h2>

        <AccountForm
          key={account.id}
          initialValues={initialValues}
          saveRevision={updateAccount.saveRevision}
          isSubmitting={updateAccount.isPending}
          error={getAccountUpdateErrorMessage(updateAccount.error)}
          status={
            updateAccount.isSuccess
              ? "Account updated successfully."
              : undefined
          }
          onSubmit={(values) => {
            const payload = formValuesToUpdatePayload(account, values);

            if (Object.keys(payload).length === 0) {
              return;
            }

            updateAccount.mutate(payload);
          }}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Change email
        </h2>
        <EmailChangeForm
          currentEmail={account.email}
          isSubmitting={changeEmail.isPending}
          error={getEmailChangeErrorMessage(changeEmail.error)}
          status={
            changeEmail.isSuccess
              ? "Verification email sent. Check your new email address to confirm the change."
              : undefined
          }
          onSubmit={(email) => changeEmail.mutate(email)}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Account details
        </h2>

        <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Email</dt>

            <dd className="mt-1 text-sm text-slate-900">
              {account.email || "Not provided"}
            </dd>
          </div>

          <div className="px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Member since</dt>

            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(account.date_joined)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
