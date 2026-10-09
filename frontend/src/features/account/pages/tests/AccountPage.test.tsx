// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/pages/tests/AccountPage.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserAccountRead } from "@/tests/factories/account";

import { AccountForm } from "../../components/form/AccountForm";
import { userAccountToFormValues } from "../../components/form/accountFormMappers";
import { EmailChangeForm } from "../../components/form/EmailChangeForm";
import { useAccount } from "../../hooks/useAccount";
import { useChangeEmail } from "../../hooks/useChangeEmail";
import { useUpdateAccount } from "../../hooks/useUpdateAccount";
import { AccountPage } from "../AccountPage";

vi.mock("../../components/form/AccountForm", () => ({
  AccountForm: vi.fn(() => <div data-testid="account-form" />),
}));

vi.mock("../../hooks/useAccount", () => ({
  useAccount: vi.fn(),
}));

vi.mock("../../hooks/useUpdateAccount", () => ({
  useUpdateAccount: vi.fn(),
}));

vi.mock("../../components/form/EmailChangeForm", () => ({
  EmailChangeForm: vi.fn(() => <div data-testid="email-change-form" />),
}));

vi.mock("../../hooks/useChangeEmail", () => ({
  useChangeEmail: vi.fn(),
}));

const accountFormMock = vi.mocked(AccountForm);
const useAccountMock = vi.mocked(useAccount);
const useUpdateAccountMock = vi.mocked(useUpdateAccount);
const emailChangeFormMock = vi.mocked(EmailChangeForm);
const useChangeEmailMock = vi.mocked(useChangeEmail);

const mutate = vi.fn();
const changeEmailMutate = vi.fn();

function mockAccountQuery(
  overrides: Partial<ReturnType<typeof useAccount>> = {},
) {
  useAccountMock.mockReturnValue({
    isLoading: false,
    isError: false,
    data: createUserAccountRead(),
    ...overrides,
  } as ReturnType<typeof useAccount>);
}

function mockUpdateAccount(
  overrides: Partial<ReturnType<typeof useUpdateAccount>> = {},
) {
  useUpdateAccountMock.mockReturnValue({
    isPending: false,
    isSuccess: false,
    error: null,
    mutate,
    saveRevision: 0,
    ...overrides,
  } as ReturnType<typeof useUpdateAccount>);
}

function getAccountFormProps() {
  const props = accountFormMock.mock.lastCall?.[0];

  expect(props).toBeDefined();

  return props!;
}

function mockChangeEmail(
  overrides: Partial<ReturnType<typeof useChangeEmail>> = {},
) {
  useChangeEmailMock.mockReturnValue({
    isPending: false,
    isSuccess: false,
    error: null,
    mutate: changeEmailMutate,
    ...overrides,
  } as ReturnType<typeof useChangeEmail>);
}

function getEmailChangeFormProps() {
  const props = emailChangeFormMock.mock.lastCall?.[0];

  expect(props).toBeDefined();

  return props!;
}

function createAxiosError(data: unknown): Error {
  return Object.assign(new Error("Request failed"), {
    isAxiosError: true,
    response: {
      data,
    },
  });
}

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAccountQuery();
    mockUpdateAccount();
    mockChangeEmail();
  });

  it("renders the loading state", () => {
    mockAccountQuery({
      isLoading: true,
      data: undefined,
    });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", { name: "Account" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Loading account...")).toBeInTheDocument();

    expect(screen.queryByTestId("account-form")).not.toBeInTheDocument();

    expect(screen.queryByTestId("email-change-form")).not.toBeInTheDocument();
  });

  it("renders an error when the account query fails", () => {
    mockAccountQuery({
      isError: true,
      data: undefined,
    });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", { name: "Account" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Could not load account.")).toBeInTheDocument();

    expect(screen.queryByTestId("account-form")).not.toBeInTheDocument();

    expect(screen.queryByTestId("email-change-form")).not.toBeInTheDocument();
  });

  it("renders the error fallback when the account data is missing", () => {
    mockAccountQuery({
      data: undefined,
    });

    render(<AccountPage />);

    expect(screen.getByText("Could not load account.")).toBeInTheDocument();

    expect(screen.queryByTestId("account-form")).not.toBeInTheDocument();

    expect(screen.queryByTestId("email-change-form")).not.toBeInTheDocument();
  });

  it("renders the loaded account", () => {
    const account = createUserAccountRead({
      username: "john.doe",
      email: "john.doe@example.com",
      first_name: "John",
      last_name: "Doe",
      date_joined: "2026-01-01T10:00:00Z",
    });

    mockAccountQuery({
      data: account,
    });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", {
        name: "Account",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("View and update your personal information."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Profile",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("account-form")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Account details",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();

    const expectedDate = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(account.date_joined));

    expect(screen.getByText(expectedDate)).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Change email" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("email-change-form")).toBeInTheDocument();
  });

  it("passes the account values and mutation state to the form", () => {
    const account = createUserAccountRead({
      username: "john.doe",
      first_name: "John",
      last_name: "Doe",
    });

    mockAccountQuery({
      data: account,
    });

    mockUpdateAccount({
      isPending: true,
    });

    render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        initialValues: userAccountToFormValues(account),
        saveRevision: 0,
        isSubmitting: true,
        error: undefined,
        status: undefined,
      }),
    );
  });

  it("submits only the changed account values", () => {
    const account = createUserAccountRead({
      username: "john.doe",
      first_name: "John",
      last_name: "Doe",
    });

    mockAccountQuery({
      data: account,
    });

    render(<AccountPage />);

    const formProps = getAccountFormProps();

    formProps.onSubmit({
      ...userAccountToFormValues(account),
      username: "john.updated",
    });

    expect(mutate).toHaveBeenCalledWith({
      username: "john.updated",
    });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("does not submit when no account values changed", () => {
    const account = createUserAccountRead();

    mockAccountQuery({
      data: account,
    });

    render(<AccountPage />);

    const formProps = getAccountFormProps();

    formProps.onSubmit(userAccountToFormValues(account));

    expect(mutate).not.toHaveBeenCalled();
  });

  it("passes the successful update state to the form", () => {
    mockUpdateAccount({
      isSuccess: true,
    });

    render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        status: "Account updated successfully.",
      }),
    );
  });

  it("passes the account update API error message to the form", () => {
    mockUpdateAccount({
      error: createAxiosError({
        username: ["A user with that username already exists."],
      }),
    });

    render(<AccountPage />);

    expect(getAccountFormProps().error).toBe(
      "Username: A user with that username already exists.",
    );

    expect(getEmailChangeFormProps().error).toBeUndefined();
  });

  it("renders the email fallback when no email is provided", () => {
    mockAccountQuery({
      data: createUserAccountRead({
        email: "",
      }),
    });

    render(<AccountPage />);

    expect(screen.getByText("Not provided")).toBeInTheDocument();
  });

  it("renders the original member-since value when the date is invalid", () => {
    mockAccountQuery({
      data: createUserAccountRead({
        date_joined: "invalid-date",
      }),
    });

    render(<AccountPage />);

    expect(screen.getByText("invalid-date")).toBeInTheDocument();
  });

  it("keeps rendering cached account data when a background refresh fails", () => {
    const account = createUserAccountRead();

    mockAccountQuery({
      isError: true,
      data: account,
    });

    render(<AccountPage />);

    expect(screen.getByTestId("account-form")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Could not refresh account information. Showing previously loaded data.",
      ),
    ).toBeInTheDocument();
  });

  it("passes the account save revision to the form", () => {
    mockUpdateAccount({
      saveRevision: 2,
    });

    render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        saveRevision: 2,
      }),
    );
  });

  it("passes the current email and mutation state to the email change form", () => {
    const account = createUserAccountRead({
      email: "current@example.com",
    });

    mockAccountQuery({ data: account });
    mockChangeEmail({ isPending: true });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", { name: "Change email" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("email-change-form")).toBeInTheDocument();

    expect(getEmailChangeFormProps()).toEqual(
      expect.objectContaining({
        currentEmail: "current@example.com",
        isSubmitting: true,
        error: undefined,
        status: undefined,
      }),
    );

    expect(getAccountFormProps().isSubmitting).toBe(false);
  });

  it("submits the new email without triggering the account update mutation", () => {
    render(<AccountPage />);

    getEmailChangeFormProps().onSubmit("new@example.com");

    expect(changeEmailMutate).toHaveBeenCalledExactlyOnceWith(
      "new@example.com",
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it("passes the email verification status without changing the displayed account email", () => {
    mockAccountQuery({
      data: createUserAccountRead({
        email: "current@example.com",
      }),
    });

    mockChangeEmail({ isSuccess: true });

    render(<AccountPage />);

    expect(getEmailChangeFormProps().status).toBe(
      "Verification email sent. Check your new email address to confirm the change.",
    );

    expect(screen.getByText("current@example.com")).toBeInTheDocument();

    expect(getAccountFormProps().status).toBeUndefined();
  });

  it("passes the email change API error message to the form", () => {
    mockChangeEmail({
      error: createAxiosError({
        errors: [
          {
            message: "This email address is already in use.",
          },
        ],
      }),
    });

    render(<AccountPage />);

    expect(getEmailChangeFormProps().error).toBe(
      "This email address is already in use.",
    );

    expect(getAccountFormProps().error).toBeUndefined();
  });

  it("passes an empty current email when no email is provided", () => {
    mockAccountQuery({
      data: createUserAccountRead({
        email: "",
      }),
    });

    render(<AccountPage />);

    expect(getEmailChangeFormProps().currentEmail).toBe("");
    expect(screen.getByText("Not provided")).toBeInTheDocument();
  });
});
