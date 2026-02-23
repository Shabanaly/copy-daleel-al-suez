export interface FlashDeal {
    id: string;
    placeId?: string;
    placeName?: string;
    title: string;
    description?: string;
    originalPrice?: number;
    dealPrice?: number;
    discountPercentage?: number;
    startDate: string;
    endDate: string;
    maxClaims?: number;
    currentClaims: number;
    status: 'active' | 'expired' | 'cancelled';
    type: 'place_deal' | 'platform_announcement' | 'native_ad' | 'adsense' | 'item_deal';
    placement: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace_feed' | 'marketplace_sidebar' | 'place_details';
    marketplaceItemId?: string;
    imageUrl?: string;
    targetUrl?: string;
    adCode?: string;
    backgroundColor?: string;
    createdAt: string;
}

export interface CreateFlashDealDTO {
    placeId?: string;
    title: string;
    description?: string;
    originalPrice?: number;
    dealPrice?: number;
    startDate: string;
    endDate: string;
    maxClaims?: number;
    type?: 'place_deal' | 'platform_announcement' | 'native_ad' | 'adsense' | 'item_deal';
    placement?: 'home_top' | 'home_middle' | 'home_bottom' | 'marketplace_feed' | 'marketplace_sidebar' | 'place_details';
    marketplaceItemId?: string;
    imageUrl?: string;
    targetUrl?: string;
    adCode?: string;
    backgroundColor?: string;
}
