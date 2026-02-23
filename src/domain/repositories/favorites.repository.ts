import { Place } from "../entities/place";
import { MarketplaceItem } from "../entities/marketplace-item";

export interface IFavoritesRepository {
    // Places
    addFavorite(userId: string, placeId: string, client?: unknown): Promise<void>;
    removeFavorite(userId: string, placeId: string, client?: unknown): Promise<void>;
    isFavorite(userId: string, placeId: string, client?: unknown): Promise<boolean>;
    getUserFavorites(userId: string, client?: unknown): Promise<{ id: string; placeId: string; place: Place | null; createdAt: string }[]>;

    // Marketplace Ads
    addMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<void>;
    removeMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<void>;
    isMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<boolean>;
    getUserFavoriteAds(userId: string, client?: unknown): Promise<{ id: string; itemId: string; item: MarketplaceItem | null; createdAt: string }[]>;
}
