// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/list/JobCandidacyPagination.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JobCandidacyPagination } from "../../list/JobCandidacyPagination";

interface RenderPaginationOptions {
  currentPage?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  isFetching?: boolean;
}

function renderPagination({
  currentPage = 2,
  totalPages = 4,
  hasPreviousPage = true,
  hasNextPage = true,
  isFetching = false,
}: RenderPaginationOptions = {}) {
  const onPageChange = vi.fn();

  render(
    <JobCandidacyPagination
      currentPage={currentPage}
      totalPages={totalPages}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      onPageChange={onPageChange}
    />,
  );

  return { onPageChange };
}

describe("JobCandidacyPagination", () => {
  it("renders the pagination navigation and current page information", () => {
    renderPagination({
      currentPage: 2,
      totalPages: 5,
    });

    expect(
      screen.getByRole("navigation", {
        name: "Candidacy pagination",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Page 2 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("requests the previous page when the Previous button is clicked", () => {
    const { onPageChange } = renderPagination({
      currentPage: 3,
    });

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("requests the next page when the Next button is clicked", () => {
    const { onPageChange } = renderPagination({
      currentPage: 3,
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("disables the Previous button when there is no previous page", () => {
    const { onPageChange } = renderPagination({
      hasPreviousPage: false,
    });

    const previousButton = screen.getByRole("button", {
      name: "Previous",
    });

    expect(previousButton).toBeDisabled();

    fireEvent.click(previousButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("disables the Next button when there is no next page", () => {
    const { onPageChange } = renderPagination({
      hasNextPage: false,
    });

    const nextButton = screen.getByRole("button", {
      name: "Next",
    });

    expect(nextButton).toBeDisabled();

    fireEvent.click(nextButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("disables both buttons while a page is being fetched", () => {
    const { onPageChange } = renderPagination({
      isFetching: true,
    });

    const previousButton = screen.getByRole("button", {
      name: "Previous",
    });
    const nextButton = screen.getByRole("button", {
      name: "Next",
    });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(previousButton);
    fireEvent.click(nextButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
