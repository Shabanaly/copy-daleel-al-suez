export interface BusinessClaim {
    id: string;
    placeId: string;
    userId: string;
    fullName: string;
    phone: string;
    businessRole: 'owner';
    proofImageUrl?: string;
    additionalNotes?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewerId?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBusinessClaimDTO {
    placeId: string;
    fullName: string;
    phone: string;
    businessRole: string;
    proofImageUrl?: string;
    additionalNotes?: string;
}
