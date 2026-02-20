'use server'

import { getCategoriesUseCase } from '@/di/modules'
import { createClient } from '@/lib/supabase/server'
import { Category } from '@/domain/entities/category'

export type CategoryWithCount = Category & { placesCount?: number }

export async function getCategoriesWithCountsAction(offset: number, limit: number): Promise<{ categories: CategoryWithCount[], total: number }> {
    const supabase = await createClient()

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

    // Check if total is null, default to 0
    return { categories: categoriesWithCounts, total: total || 0 }
}
