'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SearchResult {
    id: string
    type: 'place' | 'event' | 'article' | 'question' | 'marketplace'
    title: string
    description: string
    image?: string
    slug: string
    category?: string
    rating?: number
    date?: string // For events, news, questions
    location?: string
    district?: string
}

import { unstable_cache } from 'next/cache'

export async function searchPlacesAndEvents(query: string, areaId?: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    return await unstable_cache(
        async (q: string, aid?: string) => {
            const supabase = await createReadOnlyClient()

            // 1. Try Unified Fuzzy Search RPC
            try {
                const { data, error } = await supabase.rpc('global_search', {
                    p_query: q,
                    p_area_id: aid === 'all' ? null : aid,
                    p_limit: 20
                });

                if (!error && data) {
                    return data.map((item: any) => ({
                        id: item.id,
                        type: item.type,
                        title: item.title,
                        description: item.description?.substring(0, 80) + (item.description?.length > 80 ? '...' : ''),
                        image: item.image,
                        slug: item.type === 'place' ? `/places/${item.slug}` :
                            item.type === 'event' ? `/events/${item.id}` :
                                item.type === 'article' ? `/news/${item.slug}` :
                                    item.type === 'marketplace' ? `/marketplace/item/${item.id}` :
                                        `/community/${item.id}`,
                        category: item.category,
                        rating: item.rating,
                        date: item.date
                    }));
                }
                if (error) console.warn('[Search] RPC failed, falling back to basic search:', error.message);
            } catch (rpcErr) {
                console.warn('[Search] RPC failed, falling back:', rpcErr);
            }

            // 2. Fallback to Legacy basic search
            const results: SearchResult[] = []

            // ... (Legacy logic for Places, Events, Questions, Articles)
            // Note: I'll include the consolidated logic here for completeness in the fallback

            // Places Fallback
            let placesQuery = supabase.from('places').select('id, name, description, slug, images, categories(name), rating, areas(name, districts(name))').ilike('name', `%${q}%`).limit(10)
            if (aid && aid !== 'all') placesQuery = placesQuery.eq('area_id', aid)
            const { data: places } = await placesQuery
            if (places) {
                places.forEach(p => results.push({
                    id: p.id, type: 'place', title: p.name, description: p.description?.substring(0, 60),
                    image: p.images?.[0], slug: `/places/${p.slug}`, category: (p.categories as any)?.name,
                    rating: p.rating, location: (p.areas as any)?.name
                }))
            }

            // Events Fallback
            const { data: events } = await supabase.from('events').select('id, title, description, image_url, start_date').or(`title.ilike.%${q}%,description.ilike.%${q}%`).limit(5)
            if (events) {
                events.forEach(e => results.push({
                    id: e.id, type: 'event', title: e.title, description: e.description?.substring(0, 60),
                    image: e.image_url, slug: `/events/${e.id}`, date: e.start_date
                }))
            }

            return results
        },
        ['global-search', query, areaId || 'all'],
        { revalidate: 3600, tags: ['search'] }
    )(query, areaId);
}
