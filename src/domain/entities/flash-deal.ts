export interface FlashDeal {
    id: string;
    placeId: string;
    placeName?: string;
    title: string;
    description?: string;
    originalPrice?: number;
    dealPrice: number;
    discountPercentage?: number;
    startDate: string;
    endDate: string;
    maxClaims?: number;
    currentClaims: number;
    status: 'active' | 'expired' | 'cancelled';
    createdAt: string;
}

export interface CreateFlashDealDTO {
    placeId: string;
    title: string;
    description?: string;
    originalPrice?: number;
    dealPrice: number;
    startDate: string;
    endDate: string;
    maxClaims?: number;
}
