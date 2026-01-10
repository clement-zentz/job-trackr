// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/hooks/useJobOffers.ts

import { useEffect, useState } from "react";
import type { JobOfferRead } from "../type";
import { listJobOffers } from "@/api/jobOffer";

export function useJobOffers() {
  const [offers, setOffers] = useState<JobOfferRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listJobOffers()
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { offers, loading };
}
