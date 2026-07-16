// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/tests/DeleteJobPostingButton.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JOB_POSTINGS_LIST_PATH } from "../../constants";
import { useDeleteJobPosting } from "../../hooks/useDeleteJobPosting";
import { DeleteJobPostingButton } from "../DeleteJobPostingButton";

const { mutateMock, navigateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof ReactRouterDom>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../hooks/useDeleteJobPosting", () => ({
  useDeleteJobPosting: vi.fn(),
}));

const useDeleteJobPostingMock = vi.mocked(useDeleteJobPosting);

type MutationOverrides = Partial<ReturnType<typeof useDeleteJobPosting>>;

function mockDeleteMutation(overrides: MutationOverrides = {}) {
  useDeleteJobPostingMock.mockReturnValue({
    mutate: mutateMock,
    isPending: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useDeleteJobPosting>);
}

function renderButton() {
  return render(
    <DeleteJobPostingButton
      jobPostingId="job-posting-123"
      jobPostingTitle="Backend Developer"
    />,
  );
}

describe("DeleteJobPostingButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the delete button", () => {
    renderButton();

    expect(
      screen.getByRole("button", {
        name: "Delete job posting",
      }),
    ).toBeInTheDocument();
  });

  it("shows a confirmation dialog containing the job posting title", () => {
    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderButton();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job posting",
      }),
    );

    expect(confirmMock).toHaveBeenCalledWith(
      'Delete "Backend Developer"?\n\n' +
        "Its associated candidacy will also be deleted. " +
        "This action cannot be undone.",
    );
  });

  it("does not delete the job posting when confirmation is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderButton();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job posting",
      }),
    );

    expect(mutateMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("deletes the job posting when confirmation is accepted", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderButton();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job posting",
      }),
    );

    expect(mutateMock).toHaveBeenCalledOnce();
    expect(mutateMock).toHaveBeenCalledWith(
      "job-posting-123",
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("navigates to the job postings list after successful deletion", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderButton();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job posting",
      }),
    );

    const mutationOptions = mutateMock.mock.calls[0]?.[1] as
      | { onSuccess: () => void }
      | undefined;

    expect(mutationOptions).toBeDefined();

    mutationOptions?.onSuccess();

    expect(navigateMock).toHaveBeenCalledWith(JOB_POSTINGS_LIST_PATH, {
      replace: true,
    });
  });

  it("disables the button and shows pending text while deleting", () => {
    mockDeleteMutation({
      isPending: true,
    });

    renderButton();

    const button = screen.getByRole("button", {
      name: "Deleting...",
    });

    expect(button).toBeDisabled();
  });

  it("displays an alert when deletion fails", () => {
    mockDeleteMutation({
      isError: true,
    });

    renderButton();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not delete the job posting. Please try again.",
    );
  });

  it("does not display an error alert by default", () => {
    renderButton();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
