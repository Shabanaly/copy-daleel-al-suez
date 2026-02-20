'use server'

import { getCategoriesUseCase } from '@/di/modules'
import { createReadOnlyClient } from '@/lib/supabase/server'
import { Category } from '@/domain/entities/category'
import { unstable_cache } from 'next/cache'

export type CategoryWithCount = Category & { placesCount?: number }

async function fetchCategoriesWithCountsFromDB(offset: number, limit: number): Promise<{ categories: CategoryWithCount[], total: number }> {
    const supabase = await createReadOnlyClient()

    // Get total count of active categories
    const { count: total } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

    // Get categories with pagination
    const categories = await getCategoriesUseCase.execute({ limit, offset }, supabase)

    // Get places count for each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const { count } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('status', 'active')

            return { ...category, placesCount: count || 0 }
        })
    )

    return { categories: categoriesWithCounts, total: total || 0 }
}

const getCachedCategoriesWithCounts = unstable_cache(
    async (offset: number, limit: number) => fetchCategoriesWithCountsFromDB(offset, limit),
    ['categories-with-counts'],
    {
        revalidate: 3600, // 1 hour
        tags: ['categories', 'places']
    }
)

export async function getCategoriesWithCountsAction(offset: number, limit: number) {
    // We cache all results but could limit to first page if needed. 
    // Given categories aren't huge, caching with params is fine.
    return getCachedCategoriesWithCounts(offset, limit)
}
