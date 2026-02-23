'use server'

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth-utils';
import { revalidatePath } from 'next/cache';
import { CreateFlashDealDTO, FlashDeal } from '@/domain/entities/flash-deal';
import { SupabaseFlashDealRepository } from '@/data/repositories/supabase-flash-deal.repository';

// Note: Flash Deal repository is now acting as the generic Ads repository

export async function getAdminAdsAction(): Promise<{ success: boolean; data?: FlashDeal[]; message?: string }> {
    try {
        await requireAdmin();
        const supabase = await createClient();

        // Fetch all ads/promotions directly, joining places and items
        const { data, error } = await supabase
            .from('flash_deals')
            .select(`
                *,
                places(name, slug, images),
                marketplace_items(title, slug, images)
            `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // We manually map it here to avoid caching issues in the main app repository
        const mappedData: FlashDeal[] = (data || []).map(row => {
            const entity: FlashDeal = {
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
                status: row.status as any,
                type: row.type || 'place_deal',
                placement: row.placement || 'home_top',
                marketplaceItemId: row.marketplace_item_id,
                imageUrl: row.image_url,
                targetUrl: row.target_url,
                adCode: row.ad_code,
                createdAt: row.created_at,
                placeName: row.places?.name
            };

            if (entity.type === 'place_deal' && row.places) {
                const place = row.places;
                if (!entity.imageUrl && place.images && place.images.length > 0) {
                    entity.imageUrl = place.images[0];
                }
                if (!entity.targetUrl && place.slug) {
                    entity.targetUrl = `/places/${place.slug}`;
                }
            }

            if (entity.type === 'item_deal' && row.marketplace_items) {
                const mkItem = row.marketplace_items;
                entity.imageUrl = entity.imageUrl || (mkItem.images && mkItem.images.length > 0 ? mkItem.images[0] : undefined);
                entity.targetUrl = entity.targetUrl || `/marketplace/${mkItem.slug || mkItem.id}`;
            }

            return entity;
        });

        return { success: true, data: mappedData };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function createAdminAdAction(payload: CreateFlashDealDTO): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const supabase = await createClient();
        const repo = new SupabaseFlashDealRepository(supabase);

        await repo.createFlashDeal(payload);

        revalidatePath('/', 'layout');
        return { success: true, message: 'تم إضافة الإعلان بنجاح' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteAdminAdAction(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { error } = await supabase.from('flash_deals').delete().eq('id', id);
        if (error) throw new Error(error.message);

        revalidatePath('/', 'layout');
        return { success: true, message: 'تم حذف الإعلان نهائياً' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateAdminAdStatusAction(id: string, status: 'active' | 'inactive' | 'expired'): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { error } = await supabase.from('flash_deals').update({ status }).eq('id', id);
        if (error) throw new Error(error.message);

        revalidatePath('/', 'layout');
        return { success: true, message: 'تم التحديث بنجاح' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateAdminAdAction(id: string, payload: CreateFlashDealDTO): Promise<{ success: boolean; message: string }> {
    try {
        await requireAdmin();
        const supabase = await createClient();
        const repo = new SupabaseFlashDealRepository(supabase);

        await repo.updateFlashDeal(id, payload);

        revalidatePath('/', 'layout');
        return { success: true, message: 'تم تحديث الإعلان بنجاح' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
