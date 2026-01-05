// frontend/src/pages/JobOffers.tsx
import { useEffect, useState } from "react";
import { fetchJobOffers } from "../api/jobOffer";
import type { JobOffer } from "../types/jobOffer";


export function JobOffers() {
    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobOffers()
        .then(setOffers)
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading job offers...</p>

    return (
        <div>
            <h1>Job Offers</h1>
            <ul>
                {offers.map(o => (
                    <li key={o.id}>
                        <strong>{o.title}</strong><br/>
                        {o.company} ({o.platform})<br />
                        {o.location}
                    </li>
                ))}
            </ul>
        </div>
    );
}
