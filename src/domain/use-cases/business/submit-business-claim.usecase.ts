import { CreateBusinessClaimDTO, BusinessClaim } from "../../entities/business-claim";
import { IBusinessClaimRepository } from "../../repositories/business-claim.repository";

export class SubmitBusinessClaimUseCase {
    constructor(private businessClaimRepository: IBusinessClaimRepository) { }

    async execute(userId: string, data: CreateBusinessClaimDTO): Promise<BusinessClaim> {
        // Validation
        if (!data.fullName || !data.phone || !data.businessRole) {
            throw new Error("جميع الحقول المطلوبة يجب ملؤها");
        }

        // Check if already claimed/pending
        const existingClaim = await this.businessClaimRepository.getClaimByPlace(data.placeId);
        if (existingClaim) {
            throw new Error("يوجد طلب توثيق قيد المراجعة لهذا المكان بالفعل");
        }

        return await this.businessClaimRepository.submitClaim(userId, data);
    }
}
