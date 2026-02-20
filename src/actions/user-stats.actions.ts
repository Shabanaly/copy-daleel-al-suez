'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserStatistics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') throw error

    // Return default stats if none found (e.g. no reviews yet)
    return data || {
        total_reviews: 0,
        avg_rating: 0,
        total_favorites: 0,
        helpful_votes: 0
    }
}

export async function getReviewsByMonth() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('user_reviews_by_month')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .limit(12)

    if (error) throw error
    return data
}

export async function getCategoryBreakdown() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            places!inner(
                categories!inner(name)
            )
        `)
        .eq('user_id', user.id)

    if (error) throw error

    // Process and group by category
    const breakdown = (data as unknown[]).reduce((acc: Record<string, number>, review: unknown) => {
        const rev = review as { places: { categories: { name: string }[] | { name: string } }[] | { categories: { name: string }[] | { name: string } } };
        // Handle Supabase join structure which can return arrays for joins
        const places = Array.isArray(rev.places) ? rev.places[0] : rev.places;
        const categories = places && Array.isArray(places.categories) ? places.categories[0] : places?.categories;
        const categoryName = (categories as { name: string })?.name || 'غير مصنف'

        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return Object.entries(breakdown).map(([name, count]) => ({
        name,
        count
    }))
}
