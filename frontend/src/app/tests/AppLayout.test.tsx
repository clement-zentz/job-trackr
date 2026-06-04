// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/tests/AppLayout.test.tsx

import { screen } from "@testing-library/react";
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
            element: <div>Dashboard content</div>,
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

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Top bar menu")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });
});
