import { getAdminArticlesAction, getAdminEventsAction } from '@/actions/admin-news.actions'
import { NewsManagementList } from '@/presentation/features/admin/components'
import { Newspaper } from 'lucide-react'

export default async function AdminNewsPage() {
    const [articlesResult, eventsResult] = await Promise.all([
        getAdminArticlesAction(),
        getAdminEventsAction()
    ])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">الأخبار والفعاليات</h1>
                    <p className="text-muted-foreground mt-1">إدارة أخبار المحافظة، المقالات، والفعاليات القادمة.</p>
                </div>
            </div>

            <NewsManagementList
                initialArticles={articlesResult.articles || []}
                initialEvents={eventsResult.events || []}
            />
        </div>
    )
}
