// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/account/components/form/tests/AccountForm.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { UserAccountFormValues } from "../../../types";
import { AccountForm } from "../AccountForm";

const initialValues = {
  username: "john.doe",
  first_name: "John",
  last_name: "Doe",
} satisfies UserAccountFormValues;

function renderAccountForm({
  onSubmit = vi.fn(),
  ...props
}: Partial<React.ComponentProps<typeof AccountForm>> = {}) {
  const renderResult = render(
    <AccountForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      {...props}
    />,
  );

  return { ...renderResult, onSubmit };
}

describe("AccountForm", () => {
  it("renders the account form with the provided initial values", () => {
    renderAccountForm();

    expect(screen.getByLabelText("Username")).toHaveValue("john.doe");
    expect(screen.getByLabelText("First name")).toHaveValue("John");
    expect(screen.getByLabelText("Last name")).toHaveValue("Doe");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("enables the submit button when a field changes", async () => {
    const user = userEvent.setup();

    renderAccountForm();

    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Jane");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("submits the updated account values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: UserAccountFormValues) => void>();

    renderAccountForm({ onSubmit });

    const usernameInput = screen.getByLabelText("Username");
    await user.clear(usernameInput);
    await user.type(usernameInput, "jane.doe");

    const firstNameInput = screen.getByLabelText("First name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const lastNameInput = screen.getByLabelText("Last name");
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Smith");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      username: "jane.doe",
      first_name: "Jane",
      last_name: "Smith",
    });
  });

  it("allows optional name fields to be cleared", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: UserAccountFormValues) => void>();

    renderAccountForm({ onSubmit });

    await user.clear(screen.getByLabelText("First name"));
    await user.clear(screen.getByLabelText("Last name"));

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: "john.doe",
      first_name: "",
      last_name: "",
    });
  });

  it("disables the submit button again when changes are reverted", async () => {
    const user = userEvent.setup();

    renderAccountForm();

    const firstNameInput = screen.getByLabelText("First name");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "John");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("does not submit when no values changed", () => {
    const { onSubmit } = renderAccountForm();

    const submitButton = screen.getByRole("button", {
      name: "Save changes",
    });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit with an empty username", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderAccountForm();

    await user.clear(screen.getByLabelText("Username"));

    const submitButton = screen.getByRole("button", {
      name: "Save changes",
    });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("displays an error message", () => {
    renderAccountForm({
      error: "Could not update your account.",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not update your account.",
    );
  });

  it("displays a status message", () => {
    renderAccountForm({
      status: "Account updated successfully.",
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Account updated successfully.",
    );
  });

  it("disables the form while submitting", () => {
    renderAccountForm({
      isSubmitting: true,
    });

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("First name")).toBeDisabled();
    expect(screen.getByLabelText("Last name")).toBeDisabled();

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("marks the form as busy while submitting", () => {
    renderAccountForm({
      isSubmitting: true,
    });

    const submitButton = screen.getByRole("button", {
      name: "Saving...",
    });

    expect(submitButton.closest("form")).toHaveAttribute("aria-busy", "true");
  });

  it("does not submit while already submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: UserAccountFormValues) => void>();

    const { rerender } = renderAccountForm({ onSubmit });

    const firstNameInput = screen.getByLabelText("First name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();

    rerender(
      <AccountForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        isSubmitting
      />,
    );

    const form = screen
      .getByRole("button", { name: "Saving..." })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
