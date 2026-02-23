'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { Category } from '@/domain/entities/category'
import { Place } from '@/domain/entities/place'
import { unstable_cache } from 'next/cache'
import { placeRepository, getCategoriesUseCase, getLatestArticlesUseCase } from '@/di/modules'

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

    try {
        // Use the new N+1 fix RPC
        const { data, error } = await supabase.rpc('get_categories_with_top_places', { p_limit: 8 });

        if (!error && data) {
            const processedCategories = data.map((cat: any) => ({
                id: cat.category_id,
                name: cat.category_name,
                slug: cat.category_slug,
                description: cat.category_description,
                icon: cat.category_icon,
                color: cat.category_color,
                places: (cat.top_places || []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    images: p.images || [],
                    rating: p.rating || 0,
                    address: p.address
                })) as Place[],
                placesCount: Number(cat.places_count) || 0
            }));

            const nonEmptyCategories = processedCategories.filter((cat: any) => cat.placesCount > 0);
            const paginatedCategories = nonEmptyCategories.slice(offset, offset + limit);

            return {
                categories: paginatedCategories as CategoryWithPlaces[],
                total: nonEmptyCategories.length
            };
        }
    } catch (e) {
        console.warn("RPC get_categories_with_top_places failed, falling back to legacy N+1 logic");
    }

    // --- LEGACY FALLBACK (Slow N+1) ---
    const { data: allCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (catError) throw catError

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
                places: (placesData || []).map((record: any) => ({
                    id: record.id,
                    name: record.name,
                    slug: record.slug,
                    images: record.images || [],
                    rating: record.rating || 0,
                    address: record.address,
                })) as Place[],
                placesCount: count || 0
            }
        })
    )

    const nonEmptyCategories = processedCategories.filter(cat => cat.placesCount > 0)
    const paginatedCategories = nonEmptyCategories.slice(offset, offset + limit)

    return {
        categories: paginatedCategories as CategoryWithPlaces[],
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

// --- Cached Repository Wrappers ---

export const getCachedFeaturedPlaces = unstable_cache(
    async () => {
        const supabase = await createReadOnlyClient();
        return await placeRepository.getFeaturedPlaces(supabase);
    },
    ['featured-places'],
    { revalidate: 3600, tags: ['places'] }
);

export const getCachedTrendingPlaces = unstable_cache(
    async (limit: number) => {
        const supabase = await createReadOnlyClient();
        return await placeRepository.getTrendingPlaces(limit, supabase);
    },
    ['trending-places'],
    { revalidate: 3600, tags: ['places', 'user_events'] }
);

export const getCachedLatestPlaces = unstable_cache(
    async (limit: number) => {
        const supabase = await createReadOnlyClient();
        return await placeRepository.getLatestPlaces(limit, supabase);
    },
    ['latest-places'],
    { revalidate: 3600, tags: ['places'] }
);

export const getCachedTopRatedPlaces = unstable_cache(
    async (limit: number) => {
        const supabase = await createReadOnlyClient();
        return await placeRepository.getTopRatedPlaces(limit, supabase);
    },
    ['top-rated-places'],
    { revalidate: 3600, tags: ['places'] }
);

export const getCachedHomepageData = async () => {
    return await unstable_cache(
        async () => {
            const supabase = await createReadOnlyClient();
            return await placeRepository.getHomepageData(supabase);
        },
        ['homepage-consolidated-data'],
        { revalidate: 3600, tags: ['places', 'user_events'] }
    )();
};

export const getCachedActiveEventsAction = async (limit: number = 10) => {
    return await unstable_cache(
        async (limit: number = 10) => {
            const supabase = await createReadOnlyClient();
            const { eventRepository } = await import('@/di/modules');
            return await eventRepository.getEvents({ status: 'active', limit }, supabase);
        },
        ['active-events-home'],
        { revalidate: 3600, tags: ['events'] }
    )(limit);
};

export async function getCategoriesWithPlacesAction(offset: number, limit: number) {
    if (offset === 0) {
        return getCachedCategoriesWithPlaces(offset, limit)
    }
    return fetchCategoriesWithPlacesFromDB(offset, limit)
}

export const getCachedCategoriesAction = async () => {
    return await unstable_cache(
        async () => {
            const supabase = await createReadOnlyClient();
            return await getCategoriesUseCase.execute(undefined, supabase);
        },
        ['homepage-categories'],
        { revalidate: 3600, tags: ['categories'] }
    )();
};

export const getCachedLatestArticlesAction = async (limit: number = 3) => {
    return await unstable_cache(
        async () => {
            const supabase = await createReadOnlyClient();
            return await getLatestArticlesUseCase.execute(limit, supabase);
        },
        ['homepage-latest-articles', limit.toString()],
        { revalidate: 3600, tags: ['articles'] }
    )();
}
