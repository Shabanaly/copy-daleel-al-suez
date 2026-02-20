'use server'

import { createClient } from '@/lib/supabase/server'

export async function getExploreLocationsAction() {
    try {
        const supabase = await createClient()

        // Fetch Places with coordinates
        const { data: places, error: placesError } = await supabase
            .from('places')
            .select('id, name, slug, description, latitude, longitude, category_id, categories(name)')
            .eq('status', 'active')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)

        // Fetch Events with coordinates
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, title, slug, description, start_date, image_url')
            .eq('status', 'active')
            .not('start_date', 'is', null)
        // Note: If events don't have explicit lat/lng, they might be linked to a place.
        // But from my research SuezEvent entity has latitude/longitude fields.
        // Let's check table columns again if possible, or assume they exist based on SuezEvent.
        // Based on SuezEvent: latitude, longitude exist.
        // Based on SupabaseEventRepository mapToDb: it handles latitude/longitude? 
        // WAIT, let me check mapToDb again.

        if (placesError) throw placesError

        const mappedPlaces = (places || []).map(p => {
            const categoryData = Array.isArray(p.categories) ? p.categories[0] : p.categories
            return {
                id: p.id,
                position: [p.latitude, p.longitude] as [number, number],
                title: p.name,
                description: p.description,
                slug: p.slug,
                type: 'place' as const,
                category: categoryData?.name
            }
        })

        return { success: true, locations: mappedPlaces }
    } catch (error: any) {
        console.error("Explore Map Action Error:", error)
        return { success: false, error: error.message }
    }
}
