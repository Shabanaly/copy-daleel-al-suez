import type { Metadata } from 'next'
import { CategoriesView } from '@/presentation/features/categories-view'
import { getCategoriesWithPlacesAction } from '@/app/actions/get-categories-with-places'

export const metadata: Metadata = {
    title: 'التصنيفات | دليل السويس',
    description: 'تصفح جميع التصنيفات في دليل السويس للعثور على ما تبحث عنه بسهولة.',
}

export const revalidate = 3600;

export default async function CategoriesPage() {
    const { categories: initialCategories, total } = await getCategoriesWithPlacesAction(0, 5)

    return <CategoriesView initialCategories={initialCategories} totalCount={total || 0} />
}
