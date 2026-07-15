// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/postings/components/DeleteJobPostingButton.tsx

import { useNavigate } from "react-router-dom";

import { JOB_POSTINGS_LIST_PATH } from "../constants";
import { useDeleteJobPosting } from "../hooks/useDeleteJobPosting";

const buttonClassName =
  "inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium " +
  "text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

type DeleteJobPostingButtonProps = {
  jobPostingId: string;
  jobPostingTitle: string;
};

export function DeleteJobPostingButton({
  jobPostingId,
  jobPostingTitle,
}: DeleteJobPostingButtonProps) {
  const navigate = useNavigate();
  const deleteJobPostingMutation = useDeleteJobPosting();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${jobPostingTitle}"?\n\n` +
        "Its associated candidacy will also be deleted. " +
        "This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    deleteJobPostingMutation.mutate(jobPostingId, {
      onSuccess: () => {
        navigate(JOB_POSTINGS_LIST_PATH, {
          replace: true,
        });
      },
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteJobPostingMutation.isPending}
        className={buttonClassName}
      >
        {deleteJobPostingMutation.isPending
          ? "Deleting..."
          : "Delete job posting"}
      </button>

      {deleteJobPostingMutation.isError && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Could not delete the job posting. Please try again.
        </p>
      )}
    </div>
  );
}
