// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/pages/tests/AccountPage.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserAccountRead } from "@/tests/factories/account";

import { AccountForm } from "../../components/form/AccountForm";
import { userAccountToFormValues } from "../../components/form/accountFormMappers";
import { useAccount } from "../../hooks/useAccount";
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

const accountFormMock = vi.mocked(AccountForm);
const useAccountMock = vi.mocked(useAccount);
const useUpdateAccountMock = vi.mocked(useUpdateAccount);

const mutate = vi.fn();

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
    ...overrides,
  } as ReturnType<typeof useUpdateAccount>);
}

function getAccountFormProps() {
  const props = accountFormMock.mock.lastCall?.[0];

  expect(props).toBeDefined();

  return props!;
}

function createAxiosError(data: Record<string, string[]>): Error {
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
  });

  it("renders the error fallback when the account data is missing", () => {
    mockAccountQuery({
      data: undefined,
    });

    render(<AccountPage />);

    expect(screen.getByText("Could not load account.")).toBeInTheDocument();

    expect(screen.queryByTestId("account-form")).not.toBeInTheDocument();
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
      screen.getByText(
        "Your email address cannot currently be changed from account settings.",
      ),
    ).toBeInTheDocument();
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

  it("passes the success message to the form after an update", () => {
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

  it("passes the first field validation error to the form", () => {
    mockUpdateAccount({
      error: createAxiosError({
        username: ["A user with that username already exists."],
      }),
    });

    render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        error: "Username: A user with that username already exists.",
      }),
    );
  });

  it("maps first-name and last-name validation errors", () => {
    mockUpdateAccount({
      error: createAxiosError({
        first_name: ["This value is invalid."],
      }),
    });

    const { rerender } = render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        error: "First name: This value is invalid.",
      }),
    );

    mockUpdateAccount({
      error: createAxiosError({
        last_name: ["This value is invalid."],
      }),
    });

    rerender(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        error: "Last name: This value is invalid.",
      }),
    );
  });

  it("passes a generic error when the update error has no field message", () => {
    mockUpdateAccount({
      error: new Error("Request failed"),
    });

    render(<AccountPage />);

    expect(getAccountFormProps()).toEqual(
      expect.objectContaining({
        error: "Could not update account.",
      }),
    );
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
});
