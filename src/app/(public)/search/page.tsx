import { Suspense } from 'react'
import { SearchResultsContent } from '@/presentation/features/search/search-results-content'
import { Loader2 } from 'lucide-react'

export const metadata = {
    title: 'نتائج البحث | دليل السويس',
    description: 'ابحث عن أفضل الأماكن، الفعاليات، والأخبار في السويس',
}

export default function SearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                نتائج البحث
            </h1>
            <Suspense fallback={
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }>
                <SearchResultsContent searchParams={searchParams} />
            </Suspense>
        </div>
    )
}
