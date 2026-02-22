'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { PlaceMapper } from '@/data/mappers/place.mapper'
import { unstable_cache } from 'next/cache'

const ITEMS_PER_PAGE = 12

export interface GetPlacesParams {
    categoryId?: string;
    areaId?: string;
    search?: string;
    sort?: string;
    lastCursor?: string;
    limit?: number;
}

async function fetchPlacesFromDB(params: GetPlacesParams) {
    const {
        categoryId,
        areaId,
        search,
        sort = 'recent',
        lastCursor,
        limit = ITEMS_PER_PAGE
    } = params;

    const supabase = await createReadOnlyClient()

    let query = supabase
        .from('places')
        .select('*', { count: 'exact' })
        .eq('status', 'active')

    // Apply Category Filter
    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }

    // Apply Area Filter
    if (areaId) {
        query = query.eq('area_id', areaId)
    }

    // Apply Search Filter (Optimized with Full-Text Search)
    if (search) {
        // Use textSearch if fts_vector column exists (highly recommended as per audit)
        // Note: 'arabic' config should be set in DB
        query = query.textSearch('fts_vector', search, {
            config: 'arabic',
            type: 'websearch'
        })
    }

    // Apply Sorting
    switch (sort) {
        case 'trending':
            query = query.order('view_count', { ascending: false })
            break
        case 'rating':
            query = query.order('rating', { ascending: false })
            break
        case 'name':
            query = query.order('name', { ascending: true })
            break
        case 'newest':
        default: // 'recent'
            query = query.order('created_at', { ascending: false })
    }

    // Handle Cursor-based Pagination
    if (lastCursor) {
        if (sort === 'name') {
            query = query.gt('name', lastCursor)
        } else {
            query = query.lt('created_at', lastCursor)
        }
    }

    query = query.limit(limit)

    const { data: placesData, error, count } = await query

    if (error) {
        console.error('Error fetching places:', error)
        throw new Error('Failed to fetch places')
    }

    return {
        places: PlaceMapper.toEntities(placesData),
        total: count || 0
    }
}

// Cached version of the fetch function
const getCachedPlaces = unstable_cache(
    async (params: GetPlacesParams) => fetchPlacesFromDB(params),
    ['places-list-unified'],
    {
        revalidate: 3600, // 1 hour
        tags: ['places']
    }
)

/**
 * Unified action to fetch places with filters and pagination
 */
export async function getPlacesAction(params: GetPlacesParams) {
    // We only cache if there's no cursor (initial page) to keep cache size manageable
    if (!params.lastCursor) {
        return getCachedPlaces(params)
    }
    return fetchPlacesFromDB(params)
}

