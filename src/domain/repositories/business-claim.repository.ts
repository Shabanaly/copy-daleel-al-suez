import { BusinessClaim, CreateBusinessClaimDTO } from "../entities/business-claim";

export interface IBusinessClaimRepository {
    submitClaim(userId: string, data: CreateBusinessClaimDTO): Promise<BusinessClaim>;
    getClaimsByUser(userId: string): Promise<BusinessClaim[]>;
    getClaimByPlace(placeId: string): Promise<BusinessClaim | null>;
    updateClaimStatus(claimId: string, status: 'approved' | 'rejected', reviewerId: string, reason?: string): Promise<void>;
}
