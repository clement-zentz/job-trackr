// frontend/src/types/jobOffer.ts

// JobOfferListItem schema
export interface JobOffer {
    id: number;
    title: string;
    company: string;
    location?: string | null;
    platform: string;
}
