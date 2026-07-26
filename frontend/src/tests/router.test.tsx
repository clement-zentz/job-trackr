// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/tests/router.test.tsx

import { act, screen } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { router } from "@/router";
import { renderWithQueryClient } from "@/tests/utils";

describe("router", () => {
  it("registers the job candidacies routes", async () => {
    await act(async () => {
      await router.navigate("/jobs/candidacies");
    });

    const { unmount } = renderWithQueryClient(
      <RouterProvider router={router} />,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Job Candidacies",
      }),
    ).toBeInTheDocument();

    unmount();

    await act(async () => {
      await router.navigate("/");
    });
  });
});
