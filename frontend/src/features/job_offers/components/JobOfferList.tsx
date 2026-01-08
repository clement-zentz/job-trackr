// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/components/JobOfferList.tsx

import type { JobOffer } from "../type";
import { JobOfferRow } from "./JobOfferRow";

type Props = {
  offers: JobOffer[];
};

export function JobOfferList({ offers }: Props) {
  return (
    <>
      <div
        className="
              grid grid-cols-[1fr_1fr_1fr_1fr]
              text-xl px-2 py-1 font-bold border"
      >
        <span>Title</span>
        <span>Company</span>
        <span>Location</span>
        <span>Platform</span>
      </div>

      <ul role="list" className="list-none text-gray-300">
        {offers.map((offer) => (
          <JobOfferRow key={offer.id} offer={offer} />
        ))}
      </ul>
    </>
  );
}
