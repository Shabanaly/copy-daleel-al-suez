'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SearchResult {
    id: string
    type: 'place' | 'event' | 'article' | 'question'
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

export async function searchPlacesAndEvents(query: string, areaId?: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []

    try {
        // 1. Search Places
        let placesQuery = supabase
            .from('places')
            .select(`
                id,
                name,
                description,
                slug,
                images,
                categories(name),
                rating,
                area_id,
                areas(name, districts(name))
            `)
            .ilike('name', `%${query}%`)
            .limit(10)

        if (areaId && areaId !== 'all') {
            placesQuery = placesQuery.eq('area_id', areaId)
        }

        const { data: places, error: placesError } = await placesQuery

        if (placesError) {
            console.error('[Search] Error finding places:', placesError)
        }

        if (places) {
            places.map(place => results.push({
                id: place.id,
                type: 'place',
                title: place.name,
                description: place.description?.substring(0, 60) + '...',
                // @ts-ignore
                image: place.images && place.images.length > 0 ? place.images[0] : undefined,
                slug: `/places/${place.slug}`,
                // @ts-ignore
                category: place.categories?.name,
                rating: place.rating,
                // @ts-ignore
                location: place.areas?.name,
                // @ts-ignore
                district: place.areas?.districts?.name
            }))
        }

        // 2. Search Events
        const { data: events } = await supabase
            .from('events')
            .select(`
                id,
                title,
                description,
                slug,
                image_url,
                start_date
            `)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(5)

        if (events) {
            events.map(event => results.push({
                id: event.id,
                type: 'event',
                title: event.title,
                description: event.description?.substring(0, 60) + '...',
                image: event.image_url,
                slug: `/events/${event.id}`,
                date: event.start_date
            }))
        }

        // 3. Search Community Questions
        const { data: questions } = await supabase
            .from('community_questions')
            .select(`
                id,
                title,
                body,
                created_at,
                category
            `)
            .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
            .limit(5)

        if (questions) {
            questions.map(q => results.push({
                id: q.id,
                type: 'question',
                title: q.title,
                description: q.body?.substring(0, 60) + '...',
                slug: `/community/${q.id}`,
                category: q.category,
                date: q.created_at
            }))
        }

        // 4. Search Articles (News)
        const { data: articles } = await supabase
            .from('articles')
            .select(`
                id,
                title,
                content,
                slug,
                image_url,
                created_at
            `)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .limit(5)

        if (articles) {
            articles.map(article => results.push({
                id: article.id,
                type: 'article',
                title: article.title,
                description: article.content?.substring(0, 60) + '...',
                image: article.image_url,
                slug: `/news/${article.slug}`,
                date: article.created_at
            }))
        }

        return results
    } catch (error) {
        console.error('Search error:', error)
        return []
    }
}
