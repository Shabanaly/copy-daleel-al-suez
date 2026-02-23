import { SupabaseClient } from "@supabase/supabase-js";
import { IFavoritesRepository } from "@/domain/repositories/favorites.repository";
import { Place } from "@/domain/entities/place";
import { MarketplaceItem } from "@/domain/entities/marketplace-item";

export class SupabaseFavoritesRepository implements IFavoritesRepository {
    constructor(private supabase?: SupabaseClient) { }

    // --- Places ---

    async addFavorite(userId: string, placeId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, place_id: placeId });

        if (error) throw new Error(error.message);
    }

    async removeFavorite(userId: string, placeId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('place_id', placeId);

        if (error) throw new Error(error.message);
    }

    async isFavorite(userId: string, placeId: string, client?: unknown): Promise<boolean> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return false;

        const { data, error } = await supabase
            .from('favorites')
            .select('place_id')
            .match({ user_id: userId, place_id: placeId })
            .maybeSingle();

        if (error) throw new Error(error.message);
        return !!data;
    }

    async getUserFavorites(userId: string, client?: unknown): Promise<{ id: string; placeId: string; place: Place | null; createdAt: string }[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('favorites')
            .select('id, place_id, created_at, places(*)')
            .eq('user_id', userId)
            .is('marketplace_item_id', null)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (data as any[]).map(item => ({
            id: item.id,
            placeId: item.place_id,
            place: item.places ? this.mapPlaceToEntity(item.places) : null,
            createdAt: item.created_at
        }));
    }

    // --- Marketplace Ads ---

    async addMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, marketplace_item_id: itemId });

        if (error) throw new Error(error.message);
    }

    async removeMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('marketplace_item_id', itemId);

        if (error) throw new Error(error.message);
    }

    async isMarketplaceFavorite(userId: string, itemId: string, client?: unknown): Promise<boolean> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return false;

        const { data, error } = await supabase
            .from('favorites')
            .select('marketplace_item_id')
            .match({ user_id: userId, marketplace_item_id: itemId })
            .maybeSingle();

        if (error) throw new Error(error.message);
        return !!data;
    }

    async getUserFavoriteAds(userId: string, client?: unknown): Promise<{ id: string; itemId: string; item: MarketplaceItem | null; createdAt: string }[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('favorites')
            .select('id, marketplace_item_id, created_at, marketplace_items(*)')
            .eq('user_id', userId)
            .is('place_id', null)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (data as any[]).map(item => ({
            id: item.id,
            itemId: item.marketplace_item_id,
            item: item.marketplace_items ? this.mapAdToEntity(item.marketplace_items) : null,
            createdAt: item.created_at
        }));
    }

    // --- Mapping Logic ---

    private mapPlaceToEntity(row: any): Place {
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description || '',
            address: row.address || '',
            images: row.images || [],
            rating: row.rating || 0,
            reviewCount: row.review_count || 0,
            isFeatured: row.is_featured || false,
            isVerified: row.is_verified || false,
            isClaimed: row.is_claimed || false,
            hasDelivery: row.has_delivery || false,
            categoryId: row.category_id || '',
            areaId: row.area_id || '',
            phone: row.phone || '',
            whatsapp: row.whatsapp || '',
            googleMapsUrl: row.google_maps_url || '',
            website: row.website || '',
            socialLinks: row.social_links || {},
            opensAt: row.opens_at || null,
            closesAt: row.closes_at || null,
            type: (row.type as 'business' | 'professional') || 'business',
            status: (row.status as 'active' | 'pending' | 'inactive') || 'pending',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
        };
    }

    private mapAdToEntity(row: any): MarketplaceItem {
        return {
            id: row.id,
            slug: row.slug || row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            category: row.category,
            condition: row.condition,
            images: (row.images || []).map((img: string) => {
                if (img.startsWith('http')) {
                    if (img.includes('supabase.co') || img.includes('127.0.0.1') || img.includes('localhost')) {
                        const url = new URL(img);
                        const path = url.pathname.startsWith('/storage') ? url.pathname : `/storage${url.pathname}`;
                        return `${path}${url.search}`;
                    }
                    return img;
                }
                return img;
            }),
            location: row.location,
            area_id: row.area_id,
            seller_id: row.seller_id,
            seller_phone: row.seller_phone,
            seller_whatsapp: row.seller_whatsapp,
            status: row.status,
            rejection_reason: row.rejection_reason,
            is_featured: row.is_featured,
            viewCount: row.view_count || 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
            expires_at: row.expires_at,
            attributes: row.attributes
        };
    }
}
