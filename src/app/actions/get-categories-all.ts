'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { Category } from '@/domain/entities/category'
import { unstable_cache } from 'next/cache'

export type CategoryIndexItem = Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'color'> & {
    placesCount: number
}

async function fetchAllCategoriesFromDB(): Promise<CategoryIndexItem[]> {
    const supabase = await createReadOnlyClient()

    // 1. Get all active categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug, icon, color, sort_order')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (catError) throw catError

    // 2. Get place counts for each
    const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
            const { count } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id)
                .eq('status', 'active')

            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                placesCount: count || 0
            }
        })
    )

    return categoriesWithCount
}

export const getCategoriesAllAction = unstable_cache(
    async () => fetchAllCategoriesFromDB(),
    ['all-categories-index'],
    {
        revalidate: 3600,
        tags: ['categories']
    }
)
