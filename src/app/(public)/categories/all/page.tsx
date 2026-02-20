import type { Metadata } from 'next'
import { CategoriesIndexView } from '@/presentation/features/categories-index-view'
import { getCategoriesAllAction } from '@/app/actions/get-categories-all'

export const metadata: Metadata = {
    title: 'الفهرس الكامل للأقسام | دليل السويس',
    description: 'تصفح قائمة كاملة ومنظمة لكل الأقسام والخدمات في مدينة السويس.',
}

export const revalidate = 86400; // Cache for 24 hours as it doesn't change often

export default async function CategoriesAllPage() {
    const categories = await getCategoriesAllAction()

    return <CategoriesIndexView categories={categories} />
}
