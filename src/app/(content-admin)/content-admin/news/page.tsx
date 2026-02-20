import { getAdminArticlesAction, getAdminEventsAction } from '@/actions/admin-news.actions'
import { NewsManagementList } from '@/presentation/features/admin/components'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContentAdminNewsPage() {
    const [articlesResult, eventsResult] = await Promise.all([
        getAdminArticlesAction(),
        getAdminEventsAction(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/content-admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">الأخبار والفعاليات</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">إدارة أخبار المحافظة والفعاليات القادمة</p>
                </div>
            </div>
            <NewsManagementList
                initialArticles={articlesResult.articles || []}
                initialEvents={eventsResult.events || []}
            />
        </div>
    )
}
