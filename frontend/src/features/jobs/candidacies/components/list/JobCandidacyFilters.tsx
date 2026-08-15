// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/jobs/candidacies/components/list/JobCandidacyFilters.tsx

import {
  employmentTypeOptions,
  type NonEmptyEmploymentType,
  type NonEmptyPlatform,
  type NonEmptyWorkMode,
  platformOptions,
  workModeOptions,
} from "../../../postings/choices";
import { type CandidacyStatus, statusChoices } from "../../choices";
import type {
  JobCandidacyFilters as JobCandidacyFiltersParams,
  JobCandidacyOrdering,
} from "../../types";

interface JobCandidacyFiltersProps {
  params: JobCandidacyFiltersParams;
  updateFilter: <K extends keyof JobCandidacyFiltersParams>(
    key: K,
    value: JobCandidacyFiltersParams[K],
  ) => void;
  resetFilters: () => void;
}

export function JobCandidacyFilters({
  params,
  updateFilter,
  resetFilters,
}: JobCandidacyFiltersProps) {
  return (
    <fieldset className="mb-6 space-y-4 rounded border p-4">
      <legend className="sr-only">Job candidacy filters</legend>

      <div>
        <label htmlFor="candidacySearch" className="sr-only">
          Search candidacies
        </label>

        <input
          id="candidacySearch"
          type="search"
          placeholder="Search candidacies..."
          value={params.search ?? ""}
          onChange={(event) => updateFilter("search", event.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="candidacyStatus" className="sr-only">
            Status
          </label>

          <select
            id="candidacyStatus"
            value={params.status ?? ""}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value
                  ? (event.target.value as CandidacyStatus)
                  : undefined,
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">All statuses</option>

            {statusChoices.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="candidacyPlatform" className="sr-only">
            Platform
          </label>

          <select
            id="candidacyPlatform"
            value={params.platform ?? ""}
            onChange={(event) =>
              updateFilter(
                "platform",
                event.target.value
                  ? (event.target.value as NonEmptyPlatform)
                  : undefined,
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">All platforms</option>

            {platformOptions.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="candidacyEmploymentType" className="sr-only">
            Employment type
          </label>

          <select
            id="candidacyEmploymentType"
            value={params.employmentType ?? ""}
            onChange={(event) =>
              updateFilter(
                "employmentType",
                event.target.value
                  ? (event.target.value as NonEmptyEmploymentType)
                  : undefined,
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">All employment types</option>

            {employmentTypeOptions.map((employmentType) => (
              <option key={employmentType.value} value={employmentType.value}>
                {employmentType.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="candidacyWorkMode" className="sr-only">
            Work mode
          </label>

          <select
            id="candidacyWorkMode"
            value={params.workMode ?? ""}
            onChange={(event) =>
              updateFilter(
                "workMode",
                event.target.value
                  ? (event.target.value as NonEmptyWorkMode)
                  : undefined,
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">All work modes</option>

            {workModeOptions.map((workMode) => (
              <option key={workMode.value} value={workMode.value}>
                {workMode.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="candidacyOrdering" className="sr-only">
            Sort order
          </label>

          <select
            id="candidacyOrdering"
            value={params.ordering ?? ""}
            onChange={(event) =>
              updateFilter(
                "ordering",
                event.target.value
                  ? (event.target.value as JobCandidacyOrdering)
                  : undefined,
              )
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Default</option>
            <option value="-applied_on">Recently applied</option>
            <option value="applied_on">Oldest application</option>
            <option value="-created_at">Recently created</option>
            <option value="created_at">Oldest created</option>
            <option value="-updated_at">Recently updated</option>
            <option value="updated_at">Oldest updated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label
            htmlFor="candidacyAppliedOnAfter"
            className="mb-1 block text-sm"
          >
            Applied after
          </label>

          <input
            id="candidacyAppliedOnAfter"
            type="date"
            value={params.appliedOnAfter ?? ""}
            onChange={(event) =>
              updateFilter("appliedOnAfter", event.target.value || undefined)
            }
            className="rounded border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="candidacyAppliedOnBefore"
            className="mb-1 block text-sm"
          >
            Applied before
          </label>

          <input
            id="candidacyAppliedOnBefore"
            type="date"
            value={params.appliedOnBefore ?? ""}
            onChange={(event) =>
              updateFilter("appliedOnBefore", event.target.value || undefined)
            }
            className="rounded border px-3 py-2"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="text-sm underline"
      >
        Reset filters
      </button>
    </fieldset>
  );
}
