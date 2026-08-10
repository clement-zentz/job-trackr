// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/tests/actions/DeleteJobCandidacyButton.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JOB_CANDIDACIES_LIST_PATH } from "../../../constants";
import { useDeleteJobCandidacy } from "../../../hooks/useDeleteJobCandidacy";
import { DeleteJobCandidacyButton } from "../../actions/DeleteJobCandidacyButton";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../../../hooks/useDeleteJobCandidacy", () => ({
  useDeleteJobCandidacy: vi.fn(),
}));

type DeleteMutation = ReturnType<typeof useDeleteJobCandidacy>;

const mockedNavigate = vi.fn();
const mockedMutate = vi.fn<DeleteMutation["mutate"]>();

const mockedUseNavigate = vi.mocked(useNavigate);
const mockedUseDeleteJobCandidacy = vi.mocked(useDeleteJobCandidacy);

const defaultProps = {
  candidacyId: "candidacy-1",
  jobPostingId: "job-posting-1",
  jobPostingTitle: "Software Engineer",
};

function mockDeleteJobCandidacyMutation({
  isPending = false,
  isError = false,
}: {
  isPending?: boolean;
  isError?: boolean;
} = {}) {
  mockedUseDeleteJobCandidacy.mockReturnValue({
    mutate: mockedMutate,
    isPending,
    isError,
  } as unknown as DeleteMutation);
}

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseNavigate.mockReturnValue(mockedNavigate);
  mockDeleteJobCandidacyMutation();

  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DeleteJobCandidacyButton", () => {
  it("renders the delete button", () => {
    render(<DeleteJobCandidacyButton {...defaultProps} />);

    expect(
      screen.getByRole("button", {
        name: "Delete job candidacy",
      }),
    ).toBeInTheDocument();
  });

  it("asks for confirmation before deleting the candidacy", () => {
    render(<DeleteJobCandidacyButton {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job candidacy",
      }),
    );

    expect(window.confirm).toHaveBeenCalledWith(
      'Delete the candidacy for "Software Engineer"?\n\n' +
        "The job posting will be kept. This action cannot be undone.",
    );
  });

  it("does not delete the candidacy when confirmation is declined", () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<DeleteJobCandidacyButton {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job candidacy",
      }),
    );

    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("deletes the candidacy when confirmation is accepted", () => {
    render(<DeleteJobCandidacyButton {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job candidacy",
      }),
    );

    expect(mockedMutate).toHaveBeenCalledWith(
      {
        candidacyId: "candidacy-1",
        jobPostingId: "job-posting-1",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("navigates to the candidacy list after a successful deletion", () => {
    render(<DeleteJobCandidacyButton {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete job candidacy",
      }),
    );

    const mutationOptions = mockedMutate.mock.calls[0][1] as {
      onSuccess: () => void;
    };

    mutationOptions.onSuccess();

    expect(mockedNavigate).toHaveBeenCalledWith(JOB_CANDIDACIES_LIST_PATH, {
      replace: true,
    });
  });

  it("disables the button and shows the pending label while deleting", () => {
    mockDeleteJobCandidacyMutation({
      isPending: true,
    });

    render(<DeleteJobCandidacyButton {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: "Deleting...",
    });

    expect(button).toBeDisabled();
  });

  it("shows an error message when deletion fails", () => {
    mockDeleteJobCandidacyMutation({
      isError: true,
    });

    render(<DeleteJobCandidacyButton {...defaultProps} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not delete the job candidacy. Please try again.",
    );
  });
});
