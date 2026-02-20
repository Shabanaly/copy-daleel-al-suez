'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseFavoritesRepository } from '@/data/repositories/supabase-favorites.repository'

export async function getUserFavoritesAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const repo = new SupabaseFavoritesRepository(supabase)
    return await repo.getUserFavorites(user.id)
}

export async function getUserFavoriteAdsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const repo = new SupabaseFavoritesRepository(supabase)
    return await repo.getUserFavoriteAds(user.id)
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean, type: 'place' | 'ad' = 'place') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً')
    }

    const column = type === 'place' ? 'place_id' : 'marketplace_item_id'

    if (isFavorite) {
        // Add
        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, [column]: id })

        if (error && error.code !== '23505') { // Ignore duplicate key error
            throw new Error(error.message)
        }
    } else {
        // Remove
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq(column, id)

        if (error) {
            throw new Error(error.message)
        }

        // Track event for Personalization Engine
        if (type === 'ad') {
            const { data: item } = await supabase.from('marketplace_items').select('category').eq('id', id).single()
            if (item) {
                // Ignore error if user_events table doesn't exist yet (safe fallback)
                await supabase.from('user_events').insert({
                    user_id: user.id,
                    event_type: 'favorite',
                    entity_id: id,
                    category_id: item.category
                })
            }
        }
    }

    revalidatePath('/favorites')
    if (type === 'place') {
        revalidatePath(`/places/${id}`)
    } else {
        revalidatePath(`/marketplace/${id}`)
    }
    return { success: true }
}

export async function checkIsFavoriteAction(id: string, type: 'place' | 'ad' = 'place') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const column = type === 'place' ? 'place_id' : 'marketplace_item_id'

    const { data, error } = await supabase
        .from('favorites')
        .select(column)
        .eq('user_id', user.id)
        .eq(column, id)
        .maybeSingle()

    if (error) {
        return false
    }

    return !!data
}
