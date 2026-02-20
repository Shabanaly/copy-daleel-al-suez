import { FlashDeal, CreateFlashDealDTO } from "../entities/flash-deal";

export interface IFlashDealRepository {
    createFlashDeal(data: CreateFlashDealDTO): Promise<FlashDeal>;
    getActiveDealsByPlace(placeId: string): Promise<FlashDeal[]>;
    getGlobalActiveDeals(): Promise<FlashDeal[]>;
    cancelDeal(dealId: string): Promise<void>;
    claimDeal(dealId: string): Promise<void>;
}
