// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/features/job_offers/hooks/useJobOffers.ts

import { useEffect, useState } from "react";
import type { JobOffer } from "../type";
import { fetchJobOffers } from "@/api/jobOffer";

export function useJobOffers() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobOffers()
      .then(setOffers)
      .finally(() => setLoading(false));
  }, []);

  return { offers, loading };
}
