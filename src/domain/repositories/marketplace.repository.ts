import { MarketplaceItem, MarketplaceItemCategory } from "@/domain/entities/marketplace-item";

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface MarketplaceFilters {
    category?: MarketplaceItemCategory;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    areaId?: string;
    subType?: string;
    attributes?: Record<string, any>;
}

export interface IMarketplaceRepository {
    getItems(filters?: MarketplaceFilters, pagination?: { page: number; limit: number }, client?: unknown): Promise<PaginatedResult<MarketplaceItem>>;

    getItemById(id: string, client?: unknown): Promise<MarketplaceItem | null>;

    createItem(item: Partial<MarketplaceItem>, userId: string, client?: unknown): Promise<MarketplaceItem>;

    updateItem(id: string, updates: Partial<MarketplaceItem>, client?: unknown): Promise<MarketplaceItem>;

    deleteItem(id: string, client?: unknown): Promise<void>;

    getMyItems(userId: string, client?: unknown): Promise<MarketplaceItem[]>;

    markAsSold(id: string, userId: string, client?: unknown): Promise<void>;

    markAsActive(id: string, userId: string, client?: unknown): Promise<void>;

    relistItem(id: string, userId: string, client?: unknown): Promise<void>;

    approveItem(id: string, client?: unknown): Promise<void>;

    rejectItem(id: string, reason: string, client?: unknown): Promise<void>;



    getHomeAds(limit?: number, sortType?: 'random' | 'most_viewed' | 'lowest_price', client?: unknown): Promise<MarketplaceItem[]>;

    getSellerProfile(sellerId: string, client?: unknown): Promise<any | null>;

    getSellerItems(sellerId: string, client?: unknown): Promise<MarketplaceItem[]>;
}
