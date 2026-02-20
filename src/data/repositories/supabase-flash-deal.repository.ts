import { SupabaseClient } from "@supabase/supabase-js";
import { IFlashDealRepository } from "../../domain/repositories/flash-deal.repository";
import { FlashDeal, CreateFlashDealDTO } from "../../domain/entities/flash-deal";

export class SupabaseFlashDealRepository implements IFlashDealRepository {
    constructor(private supabase?: SupabaseClient) { }

    async createFlashDeal(data: CreateFlashDealDTO): Promise<FlashDeal> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const discountPercentage = data.originalPrice
            ? Math.round(((data.originalPrice - data.dealPrice) / data.originalPrice) * 100)
            : undefined;

        const { data: deal, error } = await this.supabase
            .from('flash_deals')
            .insert({
                place_id: data.placeId,
                title: data.title,
                description: data.description,
                original_price: data.originalPrice,
                deal_price: data.dealPrice,
                discount_percentage: discountPercentage,
                start_date: data.startDate,
                end_date: data.endDate,
                max_claims: data.maxClaims,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(deal);
    }

    async getActiveDealsByPlace(placeId: string): Promise<FlashDeal[]> {
        if (!this.supabase) return [];

        const { data, error } = await this.supabase
            .from('flash_deals')
            .select('*')
            .eq('place_id', placeId)
            .eq('status', 'active')
            .gt('end_date', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(row => this.mapToEntity(row));
    }

    async getGlobalActiveDeals(): Promise<FlashDeal[]> {
        if (!this.supabase) return [];

        const { data, error } = await this.supabase
            .from('flash_deals')
            .select('*, places(name)')
            .eq('status', 'active')
            .gt('end_date', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(row => {
            const entity = this.mapToEntity(row);
            entity.placeName = row.places?.name;
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
            createdAt: row.created_at
        };
    }
}
