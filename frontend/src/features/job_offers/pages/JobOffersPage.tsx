// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/pages/JobOffersPage.tsx

import { JobOfferList } from "@/features/job_offers/components/JobOfferList";
import { useJobOffers } from "@/features/job_offers/hooks/useJobOffers";

export function JobOffersPage() {
  const { offers, loading } = useJobOffers();

  if (loading) {
    return <p>Loading job offers...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl p-2 bg-amber-300">Job Offers</h2>
      <JobOfferList offers={offers} />
    </div>
  );
}
