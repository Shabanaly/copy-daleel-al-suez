import { SupabaseClient } from "@supabase/supabase-js";
import { IFlashDealRepository } from "../../domain/repositories/flash-deal.repository";
import { FlashDeal, CreateFlashDealDTO } from "../../domain/entities/flash-deal";

export class SupabaseFlashDealRepository implements IFlashDealRepository {
    constructor(private supabase?: SupabaseClient) { }

    async createFlashDeal(data: CreateFlashDealDTO): Promise<FlashDeal> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const discountPercentage = data.originalPrice && data.dealPrice
            ? Math.round(((data.originalPrice - data.dealPrice) / data.originalPrice) * 100)
            : undefined;

        const { data: deal, error } = await this.supabase
            .from('flash_deals')
            .insert({
                place_id: data.placeId || null,
                marketplace_item_id: data.marketplaceItemId || null,
                title: data.title,
                description: data.description,
                original_price: data.originalPrice,
                deal_price: data.dealPrice || null,
                discount_percentage: discountPercentage,
                start_date: data.startDate,
                end_date: data.endDate,
                max_claims: data.maxClaims,
                type: data.type || 'place_deal',
                placement: data.placement || 'home_top',
                image_url: data.imageUrl,
                target_url: data.targetUrl,
                ad_code: data.adCode,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(deal);
    }

    async updateFlashDeal(id: string, data: CreateFlashDealDTO): Promise<FlashDeal> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const discountPercentage = data.originalPrice && data.dealPrice
            ? Math.round(((data.originalPrice - data.dealPrice) / data.originalPrice) * 100)
            : undefined;

        const { data: deal, error } = await this.supabase
            .from('flash_deals')
            .update({
                place_id: data.placeId || null,
                marketplace_item_id: data.marketplaceItemId || null,
                title: data.title,
                description: data.description,
                original_price: data.originalPrice,
                deal_price: data.dealPrice || null,
                discount_percentage: discountPercentage,
                start_date: data.startDate,
                end_date: data.endDate,
                max_claims: data.maxClaims,
                type: data.type || 'place_deal',
                placement: data.placement || 'home_top',
                image_url: data.imageUrl,
                target_url: data.targetUrl,
                ad_code: data.adCode,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(deal);
    }

    async getActiveDealsByPlace(placeId: string): Promise<FlashDeal[]> {
        if (!this.supabase) return [];

        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from('flash_deals')
            .select('*')
            .eq('place_id', placeId)
            .eq('status', 'active')
            .gt('end_date', now)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`SupabaseFlashDealRepository.getActiveDealsByPlace Error [${placeId}]:`, error.message);
            throw new Error(error.message);
        }

        console.log(`SupabaseFlashDealRepository.getActiveDealsByPlace: Found ${data?.length || 0} ads for place ${placeId}`);
        return (data || []).map(row => this.mapToEntity(row));
    }

    async getGlobalActiveDeals(): Promise<FlashDeal[]> {
        if (!this.supabase) return [];

        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from('flash_deals')
            .select('*, places(name, slug, images), marketplace_items(*)')
            .eq('status', 'active')
            .gt('end_date', now)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("SupabaseFlashDealRepository.getGlobalActiveDeals Error:", error.message);
            throw new Error(error.message);
        }

        console.log(`SupabaseFlashDealRepository.getGlobalActiveDeals: Found ${data?.length || 0} active ads (now: ${now})`);
        return (data || []).map(row => {
            const entity = this.mapToEntity(row);
            entity.placeName = row.places?.name;

            // --- Robust Fallback Logic ---

            // 1. PLACE DEALS
            if (entity.type === 'place_deal' && row.places) {
                const place = row.places;
                // Use place's image if ad image is missing
                if (!entity.imageUrl && place.images && place.images.length > 0) {
                    entity.imageUrl = place.images[0];
                }
                // Use place's slug for target URL if missing
                if (!entity.targetUrl && place.slug) {
                    entity.targetUrl = `/places/${place.slug}`;
                }
            }

            // 2. ITEM DEALS
            if (entity.type === 'item_deal' && row.marketplace_items) {
                const mkItem = row.marketplace_items;
                // Use item's image if ad image is missing
                if (!entity.imageUrl && mkItem.images && mkItem.images.length > 0) {
                    entity.imageUrl = mkItem.images[0];
                }
                // Use item's slug for target URL if missing
                if (!entity.targetUrl) {
                    entity.targetUrl = `/marketplace/${mkItem.slug || mkItem.id}`;
                }
            }

            return entity;
        });
    }

    async cancelDeal(dealId: string): Promise<void> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const { error } = await this.supabase
            .from('flash_deals')
            .update({ status: 'cancelled' })
            .eq('id', dealId);

        if (error) throw new Error(error.message);
    }

    async claimDeal(dealId: string): Promise<void> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        // Simple increment for now. Real-world would need a transaction or RPC for atomicity.
        const { error } = await this.supabase.rpc('increment_flash_deal_claims', { p_deal_id: dealId });

        if (error) throw new Error(error.message);
    }

    private mapToEntity(row: any): FlashDeal {
        return {
            id: row.id,
            placeId: row.place_id,
            title: row.title,
            description: row.description,
            originalPrice: row.original_price,
            dealPrice: row.deal_price,
            discountPercentage: row.discount_percentage,
            startDate: row.start_date,
            endDate: row.end_date,
            maxClaims: row.max_claims,
            currentClaims: row.current_claims,
            status: row.status as 'active' | 'expired' | 'cancelled',
            type: row.type || 'place_deal',
            placement: row.placement || 'home_top',
            marketplaceItemId: row.marketplace_item_id,
            imageUrl: row.image_url,
            targetUrl: row.target_url,
            adCode: row.ad_code,
            backgroundColor: row.background_color,
            createdAt: row.created_at
        };
    }
}
