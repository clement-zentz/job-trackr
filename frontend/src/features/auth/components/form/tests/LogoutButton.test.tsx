// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/auth/components/form/tests/LogoutButton.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LogoutButton } from "../LogoutButton";

const mockUseLogout = vi.fn();

vi.mock("../../../hooks/useLogout", () => ({
  useLogout: () => mockUseLogout(),
}));

describe("LogoutButton", () => {
  it("renders the sign out button", () => {
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  });

  it("logs out when clicked", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    mockUseLogout.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mutate).toHaveBeenCalledOnce();
  });

  it("disables the button while logout is pending", () => {
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: "Signing out..." });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("does not log out again while logout is pending", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    mockUseLogout.mockReturnValue({
      mutate,
      isPending: true,
    });

    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Signing out..." }));

    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows an error message when logout fails", async () => {
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
    });

    render(<LogoutButton />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sign out failed. Please try again.",
    );

    expect(
      screen.getByRole("button", {
        name: "Sign out",
      }),
    ).toBeEnabled();
  });
});
