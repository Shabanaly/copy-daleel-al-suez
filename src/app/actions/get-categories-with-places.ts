'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { Category } from '@/domain/entities/category'
import { Place } from '@/domain/entities/place'
import { unstable_cache } from 'next/cache'

export interface CategoryWithPlaces extends Category {
    places: Place[]
    placesCount: number
}

interface GetCategoriesWithPlacesResponse {
    categories: CategoryWithPlaces[]
    total: number
}

async function fetchCategoriesWithPlacesFromDB(offset: number, limit: number): Promise<GetCategoriesWithPlacesResponse> {
    const supabase = await createReadOnlyClient()

    // 1. Get total count of active categories that actually HAVE places
    // We'll filter in JS because complex subquery counts in Supabase can be tricky with the current schema
    // But for total pagination count, we need a reliable number.

    // 1. Get all active categories with all necessary fields
    const { data: allCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (catError) throw catError

    // 2. For each category, get the count and top 8 places
    const processedCategories = await Promise.all(
        allCategories.map(async (cat) => {
            const { data: placesData, count } = await supabase
                .from('places')
                .select('*', { count: 'exact' })
                .eq('category_id', cat.id)
                .eq('status', 'active')
                .order('rating', { ascending: false })
                .limit(8)

            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                icon: cat.icon,
                color: cat.color,
                sortOrder: cat.sort_order || 0,
                displayOrder: cat.display_order,
                isActive: cat.is_active,
                createdAt: cat.created_at,
                updatedAt: cat.updated_at,
                places: (placesData || []).map((record: any) => ({
                    id: record.id,
                    name: record.name,
                    slug: record.slug,
                    description: record.description,
                    address: record.address,
                    images: record.images || [],
                    rating: record.rating || 0,
                    reviewCount: record.review_count || 0,
                    viewCount: record.view_count || 0,
                    createdAt: record.created_at,
                    categoryId: record.category_id,
                })) as Place[],
                placesCount: count || 0
            }
        })
    )

    // 3. Filter out empty ones
    const nonEmptyCategories = processedCategories.filter(cat => cat.placesCount > 0)

    // 4. Manual pagination on the non-empty categories
    const paginatedCategories = nonEmptyCategories.slice(offset, offset + limit)

    return {
        categories: paginatedCategories,
        total: nonEmptyCategories.length
    }
}

const getCachedCategoriesWithPlaces = unstable_cache(
    async (offset: number, limit: number) => fetchCategoriesWithPlacesFromDB(offset, limit),
    ['categories-with-top-places'],
    {
        revalidate: 3600,
        tags: ['categories', 'places']
    }
)

export async function getCategoriesWithPlacesAction(offset: number, limit: number) {
    // We only cache the first page to keep it snappy
    if (offset === 0) {
        return getCachedCategoriesWithPlaces(offset, limit)
    }
    return fetchCategoriesWithPlacesFromDB(offset, limit)
}
