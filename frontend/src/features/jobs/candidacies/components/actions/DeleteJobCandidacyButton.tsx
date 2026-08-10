// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/actions/DeleteJobCandidacyButton.tsx

import { useNavigate } from "react-router-dom";

import { JOB_CANDIDACIES_LIST_PATH } from "../../constants";
import { useDeleteJobCandidacy } from "../../hooks/useDeleteJobCandidacy";

const buttonClassName =
  "inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium " +
  "text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

interface DeleteJobCandidacyButtonProps {
  candidacyId: string;
  jobPostingId: string;
  jobPostingTitle: string;
}

export function DeleteJobCandidacyButton({
  candidacyId,
  jobPostingId,
  jobPostingTitle,
}: DeleteJobCandidacyButtonProps) {
  const navigate = useNavigate();
  const deleteJobCandidacyMutation = useDeleteJobCandidacy();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete the candidacy for "${jobPostingTitle}"?\n\n` +
        "The job posting will be kept. This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    deleteJobCandidacyMutation.mutate(
      {
        candidacyId,
        jobPostingId,
      },
      {
        onSuccess: () => {
          navigate(JOB_CANDIDACIES_LIST_PATH, {
            replace: true,
          });
        },
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteJobCandidacyMutation.isPending}
        className={buttonClassName}
      >
        {deleteJobCandidacyMutation.isPending
          ? "Deleting..."
          : "Delete job candidacy"}
      </button>

      {deleteJobCandidacyMutation.isError && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Could not delete the job candidacy. Please try again.
        </p>
      )}
    </div>
  );
}
