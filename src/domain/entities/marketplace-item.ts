export type MarketplaceItemCategory = string;

export type MarketplaceItemCondition =
    | 'new'
    | 'like_new'
    | 'good'
    | 'fair'
    | 'for_parts';

export type MarketplaceItemStatus =
    | 'pending'
    | 'active'
    | 'rejected'
    | 'sold'
    | 'expired'
    | 'removed';

export interface MarketplaceItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    price_type?: 'fixed' | 'negotiable' | 'contact';

    category: MarketplaceItemCategory;
    condition: MarketplaceItemCondition | null;

    images: string[];

    location?: string;
    area_id?: string;
    area_name?: string;
    district_name?: string;

    seller_id: string;
    seller_name?: string;
    seller_avatar?: string;
    seller_phone?: string;
    seller_whatsapp?: string;

    status: MarketplaceItemStatus;
    rejection_reason?: string;

    is_featured: boolean;
    viewCount: number;

    created_at: string;
    updated_at: string;
    expires_at?: string;

    attributes?: Record<string, any>;
    last_bump_at?: string;
}

