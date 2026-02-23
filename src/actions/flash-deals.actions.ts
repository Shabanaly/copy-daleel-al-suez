'use server'

import { unstable_cache } from 'next/cache';
import { SupabaseFlashDealRepository } from '@/data/repositories/supabase-flash-deal.repository';
import { createClient, createReadOnlyClient } from '@/lib/supabase/server';
import { FlashDeal } from '@/domain/entities/flash-deal';

export async function getActivePromotionsAction(): Promise<FlashDeal[]> {
    return unstable_cache(
        async () => {
            try {
                const supabase = await createReadOnlyClient();
                const repo = new SupabaseFlashDealRepository(supabase);
                const deals = await repo.getGlobalActiveDeals();
                return deals;
            } catch (error) {
                console.error("Failed to fetch active promotions:", error);
                return [];
            }
        },
        ['global-promotions'],
        { revalidate: 1800, tags: ['promotions', 'flash_deals'] }
    )();
}

export async function getPlacePromotionsAction(placeId: string): Promise<FlashDeal[]> {
    return unstable_cache(
        async () => {
            try {
                const supabase = await createReadOnlyClient();
                const repo = new SupabaseFlashDealRepository(supabase);
                const deals = await repo.getActiveDealsByPlace(placeId);
                return deals;
            } catch (error) {
                console.error(`Failed to fetch promotions for place ${placeId}:`, error);
                return [];
            }
        },
        [`place-promotions-${placeId}`],
        { revalidate: 1800, tags: ['promotions', 'flash_deals', `place-promotions-${placeId}`] }
    )();
}

export async function getItemPromotionsAction(itemId: string): Promise<FlashDeal[]> {
    return unstable_cache(
        async () => {
            try {
                const supabase = await createReadOnlyClient();
                const now = new Date().toISOString();
                const { data, error } = await supabase
                    .from('flash_deals')
                    .select('*, marketplace_items(*)')
                    .eq('marketplace_item_id', itemId)
                    .eq('status', 'active')
                    .gt('end_date', now)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                console.log(`getItemPromotionsAction: Found ${data?.length || 0} ads for item ${itemId} (now: ${now})`);
                return (data || []).map(row => ({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    imageUrl: row.image_url,
                    targetUrl: row.target_url,
                    type: row.type,
                    dealPrice: row.deal_price,
                    originalPrice: row.original_price,
                    discountPercentage: row.discount_percentage
                })) as any;
            } catch (error) {
                console.error(`Failed to fetch promotions for item ${itemId}:`, error);
                return [];
            }
        },
        [`item-promotions-${itemId}`],
        { revalidate: 1800, tags: ['promotions', 'flash_deals', `item-promotions-${itemId}`] }
    )();
}

