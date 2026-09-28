// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/tests/AppLayout.test.tsx

import { screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { renderWithQueryClient } from "@/tests/utils";

import { AppLayout } from "../AppLayout";

function renderAppLayout() {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <div>Nested route content</div>,
          },
        ],
      },
    ],
    {
      initialEntries: ["/"],
    },
  );

  return renderWithQueryClient(<RouterProvider router={router} />);
}

describe("AppLayout", () => {
  it("renders the app shell and nested route content", () => {
    renderAppLayout();

    expect(screen.getByRole("link", { name: "Job Trackr" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Sign out",
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("main")).getByText("Nested route content"),
    ).toBeInTheDocument();
  });
});
