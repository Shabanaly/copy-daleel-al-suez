'use server'

import { createClient, createReadOnlyClient } from "@/lib/supabase/server";
import { CityPulseItem } from "@/domain/entities/city-pulse-item";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache as reactCache } from "react";
import { requireAdmin } from "@/lib/supabase/auth-utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function mapRow(row: any): CityPulseItem {
    return {
        id: row.id,
        text: row.text,
        iconType: row.icon_type ?? 'sparkles',
        isActive: row.is_active,
        startsAt: row.starts_at ?? null,
        endsAt: row.ends_at ?? null,
        priority: row.priority ?? 0,
        source: row.source ?? 'manual',
        sourceId: row.source_id ?? null,
        createdAt: row.created_at,
    };
}

// ─── Public: used by Home page ────────────────────────────────────────────────

/**
 * Returns only the items that are currently active & within their time window.
 * Ordered by priority DESC then created_at DESC.
 */
export const getActiveCityPulseItems = reactCache(async (): Promise<CityPulseItem[]> => {
    try {
        const supabase = await createReadOnlyClient();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('city_pulse_items')
            .select('*')
            .eq('is_active', true)
            .or(`starts_at.is.null,starts_at.lte.${now}`)
            .or(`ends_at.is.null,ends_at.gte.${now}`)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[CityPulse] fetch error:', error.message);
            return [];
        }

        return (data ?? []).map(mapRow);
    } catch (err) {
        console.error('[CityPulse] unexpected error:', err);
        return [];
    }
})

export const getCachedActiveCityPulseItems = unstable_cache(
    async () => {
        return await getActiveCityPulseItems();
    },
    ['active-city-pulse'],
    { revalidate: 900, tags: ['city-pulse'] } // 15 minutes as requested
)

// ─── Admin: full CRUD ─────────────────────────────────────────────────────────

export async function getAllCityPulseItems(): Promise<CityPulseItem[]> {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from('city_pulse_items')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRow);
}

export type CreateCityPulseInput = {
    text: string;
    iconType?: CityPulseItem['iconType'];
    isActive?: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    priority?: number;
    source?: CityPulseItem['source'];
    sourceId?: string | null;
};

export async function createCityPulseItemAction(input: CreateCityPulseInput): Promise<void> {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from('city_pulse_items').insert({
        text: input.text.trim(),
        icon_type: input.iconType ?? 'sparkles',
        is_active: input.isActive ?? true,
        starts_at: input.startsAt ?? null,
        ends_at: input.endsAt ?? null,
        priority: input.priority ?? 0,
        source: input.source ?? 'manual',
        source_id: input.sourceId ?? null,
    });

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/city-pulse');
}

export type UpdateCityPulseInput = Partial<CreateCityPulseInput>;

export async function updateCityPulseItemAction(id: string, input: UpdateCityPulseInput): Promise<void> {
    const { supabase } = await requireAdmin();

    const patch: Record<string, unknown> = {};
    if (input.text !== undefined) patch.text = input.text.trim();
    if (input.iconType !== undefined) patch.icon_type = input.iconType;
    if (input.isActive !== undefined) patch.is_active = input.isActive;
    if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
    if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
    if (input.priority !== undefined) patch.priority = input.priority;

    const { error } = await supabase
        .from('city_pulse_items')
        .update(patch)
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/city-pulse');
}

export async function deleteCityPulseItemAction(id: string): Promise<void> {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('city_pulse_items')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/city-pulse');
}

/**
 * Called when an admin publishes an Event — auto-creates a pulse item
 * tied to the event's end date so it disappears automatically.
 */
export async function createPulseFromEvent(event: {
    id: string;
    title: string;
    endDate?: string | null;
    startDate: string;
}): Promise<void> {
    // Don't create duplicate entries
    const supabase = await createClient();
    const { data: existing } = await supabase
        .from('city_pulse_items')
        .select('id')
        .eq('source', 'event')
        .eq('source_id', event.id)
        .maybeSingle();

    if (existing) return; // already linked

    await createCityPulseItemAction({
        text: `فعالية قادمة: ${event.title} 🎉`,
        iconType: 'calendar',
        isActive: true,
        startsAt: null,
        endsAt: event.endDate ?? null,
        priority: 10, // bump events up
        source: 'event',
        sourceId: event.id,
    });
}
