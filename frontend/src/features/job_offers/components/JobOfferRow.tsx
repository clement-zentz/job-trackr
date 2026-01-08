// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/components/JobOfferRow.tsx

import type { JobOffer } from "../type";

type Props = {
  offer: JobOffer;
};

export function JobOfferRow({ offer }: Props) {
  return (
    <li
      className="
              grid grid-cols-[1fr_1fr_1fr_1fr]
              px-2 py-1"
    >
      <span className="truncate">
        <strong>{offer.title}</strong>
      </span>
      <span>{offer.company}</span>
      <span>{offer.location}</span>
      <span>{offer.platform}</span>
    </li>
  );
}
